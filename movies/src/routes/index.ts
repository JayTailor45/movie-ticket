import express, { Request, Response } from "express";
import { Movie } from "../models/movie";

const router = express.Router();

router.get("/api/movies", async (req: Request, res: Response) => {
  const movies = await Movie.find({});
  res.send(movies);
});

export { router as indexMovieRouter };
