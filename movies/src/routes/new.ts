import express, { Request, Response } from "express";
import { body } from "express-validator";
import { middlewares as mw } from "@tj-movies-ticket/common";
import { Movie } from "../models/movie";
import { MovieCreatedPublisher } from "../events/publishers/movie-created.publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/api/movies",
  mw.requireAuth,
  [
    body("name").not().isEmpty().isString().withMessage("Name is required"),
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
  mw.validateRequest,
  async (req: Request, res: Response) => {
    const {
      name,
      description,
      releaseDate,
      genres,
      languages,
      director,
      actors,
    } = req.body;
    const movie = Movie.build({
      name,
      description,
      director,
      releaseDate,
      languages,
      genres,
      actors,
    });
    await movie.save();

    new MovieCreatedPublisher(natsWrapper.client).publish({
      id: movie.id,
      name: movie.name,
      description: movie.description,
      director: movie.director,
      releaseDate: movie.releaseDate,
      languages: movie.languages,
      genres: movie.genres,
      actors: movie.actors,
      version: movie.version,
    });

    res.status(200).send(movie);
  },
);

export { router as createMovieRouter };
