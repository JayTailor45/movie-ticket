import express, { Request, Response } from "express";
import { body, param } from "express-validator";
import { middlewares as mw, errors as Err } from "@tj-movies-ticket/common";
import { Movie } from "../models/movie";
import { Types as MongooseTypes } from "mongoose";
import { natsWrapper } from "../nats-wrapper";
import { MovieUpdatedPublisher } from "../events/publishers/movie-updated.publisher";

const router = express.Router();

router.put(
  "/api/movies/:id",
  mw.requireAuth,
  [
    param("id")
      .custom((idValue) => MongooseTypes.ObjectId.isValid(idValue))
      .withMessage("id must be a valid MongoDB ObjectId"),
    body("name").not().isEmpty().withMessage("Name is required string"),
    body("description")
      .not()
      .isEmpty()
      .isString()
      .withMessage("Description is required"),
    body("releaseDate")
      .not()
      .isEmpty()
      .isString()
      .withMessage("Release Date is required"),
    body("genres").isArray({ min: 1 }).withMessage("Genres are required"),
    body("languages").isArray({ min: 1 }).withMessage("Languages are required"),
    body("director")
      .not()
      .isEmpty()
      .isString()
      .withMessage("Director is required"),
    body("actors").isArray({ min: 1 }).withMessage("Actors are required"),
  ],
  async (req: Request, res: Response) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      throw new Err.NotFoundError();
    }

    const {
      name,
      description,
      languages,
      genres,
      actors,
      director,
      releaseDate,
    } = req.body;

    movie.set({
      name,
      description,
      languages,
      genres,
      actors,
      director,
      releaseDate,
    });

    await movie.save();

    new MovieUpdatedPublisher(natsWrapper.client).publish({
      id: movie.id,
      name: movie.name,
      description: movie.description,
      director: movie.director,
      releaseDate: movie.releaseDate.toISOString(),
      languages: movie.languages,
      genres: movie.genres,
      actors: movie.actors,
      version: movie.version,
    });

    res.send(movie);
  },
);

export { router as updateMovieRouter };
