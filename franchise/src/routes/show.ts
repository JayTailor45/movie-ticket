import express, { Request, Response } from "express";
import { errors as Err } from "@tj-movies-ticket/common";
import { param } from "express-validator";
import { Types as MongooseTypes } from "mongoose";
import { Franchise } from "../models/franchise";

const router = express.Router();

router.get(
  "/api/franchise/:id",
  [
    param("id")
      .custom((idValue) => MongooseTypes.ObjectId.isValid(idValue))
      .withMessage("id must be a valid MongoDB ObjectId"),
  ],
  async (req: Request, res: Response) => {
    const franchise = await Franchise.findById(req.params.id);
    if (!franchise) {
      throw new Err.NotFoundError();
    }
    res.send(franchise);
  },
);

export { router as showFranchiseRouter };
