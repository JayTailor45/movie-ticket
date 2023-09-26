import express, { Request, Response } from "express";
import { body } from "express-validator";
import { middlewares as mw } from "@tj-movies-ticket/common";
import { Franchise } from "../models/franchise";
import { FranchiseCreatedPublisher } from "../events/publishers/franchise-created.publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/api/franchise",
  mw.requireAuth,
  [
    body("name").not().isEmpty().isString().withMessage("Name is required"),
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
    body("city").isString().not().isEmpty().withMessage("City is required"),
  ],
  mw.validateRequest,
  async (req: Request, res: Response) => {
    const { name, description, address, city } = req.body;
    const franchise = Franchise.build({
      name,
      description,
      address,
      city,
    });
    await franchise.save();

    new FranchiseCreatedPublisher(natsWrapper.client).publish({
      id: franchise.id,
      name: franchise.name,
      description: franchise.description,
      address: franchise.address,
      city: franchise.city,
      version: franchise.version,
    });

    res.status(200).send(franchise);
  },
);

export { router as createFranchiseRouter };
