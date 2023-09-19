import express, { Request, Response } from "express";
import { errors as Err } from "@tj-movies-ticket/common";
import { param } from "express-validator";
import { Types as MongooseTypes } from "mongoose";
import { Movie } from "../models/movie";

const router = express.Router();

router.get(
  "/api/movies/:id",
  [
    param("id")
      .custom((idValue) => MongooseTypes.ObjectId.isValid(idValue))
      .withMessage("id must be a valid MongoDB ObjectId"),
  ],
  async (req: Request, res: Response) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      throw new Err.NotFoundError();
    }
    res.send(movie);
  }
);

export { router as showMovieRouter };
