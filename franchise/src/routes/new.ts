import express, { Request, Response } from "express";
import { body } from "express-validator";
import { middlewares as mw, errors as Err } from "@tj-movies-ticket/common";
import { Franchise } from "../models/franchise";
import { FranchiseCreatedPublisher } from "../events/publishers/franchise-created.publisher";
import { natsWrapper } from "../nats-wrapper";
import { User } from "../models/user";

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
    body("email").isEmail().withMessage("Franchise user email is required"),
  ],
  mw.validateRequest,
  async (req: Request, res: Response) => {
    const { name, description, address, city, email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new Err.BadRequestError("User does not exists");
    }

    const existingFranchise = await Franchise.findOne({ user });

    if (existingFranchise) {
      throw new Err.BadRequestError("User is already assigned to franchise");
    }

    const franchise = Franchise.build({
      name,
      description,
      address,
      city,
      user,
    });

    await franchise.save();

    new FranchiseCreatedPublisher(natsWrapper.client).publish({
      id: franchise.id,
      name: franchise.name,
      description: franchise.description,
      address: franchise.address,
      city: franchise.city,
      user: franchise.user.id,
      version: franchise.version,
    });

    res.status(200).send(franchise);
  },
);

export { router as createFranchiseRouter };
