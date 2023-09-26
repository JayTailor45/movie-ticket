import express, { Request, Response } from "express";
import { body, param } from "express-validator";
import { middlewares as mw, errors as Err } from "@tj-movies-ticket/common";
import { Show } from "../models/show";
import { Types as MongooseTypes } from "mongoose";
import { natsWrapper } from "../nats-wrapper";
import { ShowUpdatedPublisher } from "../events/publishers/show-updated.publisher";

const router = express.Router();

router.put(
  "/api/shows/:id",
  mw.requireAuth,
  [
    param("id")
      .custom((idValue) => MongooseTypes.ObjectId.isValid(idValue))
      .withMessage("id must be a valid MongoDB ObjectId"),
    // body("movie").isString().not().isEmpty().withMessage("Movie is required"),
    // body("franchise")
    //   .isString()
    //   .not()
    //   .isEmpty()
    //   .withMessage("Franchise is required"),
    body("price").isFloat({ min: 100.0 }).withMessage("Price is required"),
    body("capacity").isInt({ min: 80 }).withMessage("Capacity is required"),
    body("startTime").isDate().withMessage("Start time is required"),
    body("endTime").isDate().withMessage("End time is required"),
  ],
  async (req: Request, res: Response) => {
    const show = await Show.findById(req.params.id);

    if (!show) {
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
      // movie,
      // franchise,
    } = req.body;

    show.set({
      name,
      description,
      languages,
      genres,
      actors,
      director,
      releaseDate,
    });

    await show.save();

    new ShowUpdatedPublisher(natsWrapper.client).publish({
      id: show.id,
      capacity: show.capacity,
      price: show.price,
      startTime: show.startTime.toISOString(),
      endTime: show.endTime.toISOString(),
      movie: show.movie.id,
      franchise: show.franchise.id,
      version: show.version,
    });

    res.send(show);
  },
);

export { router as updateShowRouter };
