import express, { Request, Response } from "express";
import { errors as Err } from "@tj-movies-ticket/common";
import { param } from "express-validator";
import { Types as MongooseTypes } from "mongoose";
import { Show } from "../models/show";

const router = express.Router();

router.get(
  "/api/shows/:id",
  [
    param("id")
      .custom((idValue) => MongooseTypes.ObjectId.isValid(idValue))
      .withMessage("id must be a valid MongoDB ObjectId"),
  ],
  async (req: Request, res: Response) => {
    const show = await Show.findById(req.params.id);
    if (!show) {
      throw new Err.NotFoundError();
    }
    res.send(show);
  },
);

export { router as showShowRouter };
