import express, { Request, Response } from "express";
import { body } from "express-validator";
import { middlewares as mw, errors as Err } from "@tj-movies-ticket/common";
import { Show } from "../models/show";
import { Movie } from "../models/movie";
import { Franchise } from "../models/franchise";
import { ShowCreatedPublisher } from "../events/publishers/show-created.publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/api/shows/",
  mw.requireAuth,
  [
    body("movie").isString().not().isEmpty().withMessage("Movie is required"),
    body("franchise")
      .isString()
      .not()
      .isEmpty()
      .withMessage("Franchise is required"),
    body("price").isFloat({ min: 100.0 }).withMessage("Price is required"),
    body("capacity").isInt({ min: 80 }).withMessage("Capacity is required"),
    body("startTime").isDate().withMessage("Start time is required"),
    body("endTime").isDate().withMessage("End time is required"),
  ],
  mw.validateRequest,
  async (req: Request, res: Response) => {
    const {
      price,
      capacity,
      startTime,
      endTime,
      movie: movieId,
      franchise: franchiseId,
    } = req.body;

    const movie = await Movie.findById(movieId);
    if (!movie) {
      throw new Err.NotFoundError();
    }
    const franchise = await Franchise.findById(franchiseId);
    if (!franchise) {
      throw new Err.NotFoundError();
    }

    const show = Show.build({
      price,
      capacity,
      startTime,
      endTime,
      movie,
      franchise,
    });

    await show.save();

    new ShowCreatedPublisher(natsWrapper.client).publish({
      id: show.id,
      capacity: show.capacity,
      price: show.price,
      startTime: show.startTime.toISOString(),
      endTime: show.endTime.toISOString(),
      movie: movie.id,
      franchise: franchise.id,
      version: show.version,
    });

    res.status(200).send(show);
  },
);

export { router as createShowRouter };
