import {
  errors as Err,
  middlewares as mw,
  enums,
} from "@tj-movies-ticket/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Show } from "../models/show";
import { Order } from "../models/order";
import { OrderCreatedPublisher } from "../events/publishers/order-created.publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 10 * 60;

router.post(
  "/api/orders",
  mw.requireAuth,
  [body("showId").not().isEmpty().withMessage("ShowId is required")],
  mw.validateRequest,
  async (req: Request, res: Response) => {
    const { showId } = req.body;

    // Find the show the user is trying to order in the database
    const show = await Show.findById(showId);
    if (!show) {
      throw new Err.NotFoundError();
    }

    // Make sure that the show is not fully reserved
    // const isReserved = await show.isReserved();
    // if (isReserved) {
    //   throw new Err.BadRequestError("Show is already fully reserved");
    // }

    // Calculate expiration date for the order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save to database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: enums.OrderStatus.CREATED,
      expiresAt: expiration,
      show,
    });
    await order.save();

    // Publish an event saying the order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      show: {
        id: show.id,
        price: show.price,
      },
    });

    res.status(201).send(order);
  },
);

export { router as newOrderRouter };
