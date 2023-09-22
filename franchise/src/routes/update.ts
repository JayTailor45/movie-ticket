import express, { Request, Response } from "express";
import { body, param } from "express-validator";
import { middlewares as mw, errors as Err } from "@tj-movies-ticket/common";
import { Franchise } from "../models/franchise";
import { Types as MongooseTypes } from "mongoose";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.put(
  "/api/franchise/:id",
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
    body("address")
      .not()
      .isEmpty()
      .isString()
      .withMessage("Address is required"),
    body("city")
      .isString()
      .not()
      .isEmpty()
      .withMessage("City is required"),
  ],
  async (req: Request, res: Response) => {
    const franchise = await Franchise.findById(req.params.id);

    if (!franchise) {
      throw new Err.NotFoundError();
    }

    const {
      name,
      description,
      address,
      city,
    } = req.body;

    franchise.set({
      name,
      description,
      address,
      city,
    });

    await franchise.save();

    res.send(franchise);
  }
);

export { router as updateFranchiseRouter };
