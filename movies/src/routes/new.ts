import express, { Request, Response } from "express";
import { body } from "express-validator";
import { middlewares as mw } from "@tj-movies-ticket/common";
import { Movie } from "../models/movie";

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
    body("genres").not().isEmpty().isArray().withMessage("Genres are required"),
    body("languages")
      .not()
      .isEmpty()
      .isArray()
      .withMessage("Languages are required"),
    body("director")
      .not()
      .isEmpty()
      .isString()
      .withMessage("Director is required"),
    body("actors").not().isEmpty().isArray().withMessage("Actors are required"),
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

    res.status(200).send(movie);
  }
);

export { router as createMovieRouter };
