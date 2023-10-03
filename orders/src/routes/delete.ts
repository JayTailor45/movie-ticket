import express, { Request, Response } from "express";
import { Order } from "../models/order";
import {
  errors as Err,
  middlewares as mw,
  enums,
} from "@tj-movies-ticket/common";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled.publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  mw.requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("show");

    if (!order) {
      throw new Err.NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new Err.UnAuthorizedError();
    }

    order.status = enums.OrderStatus.CANCELLED;
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      show: {
        id: order.show.id,
      },
    });

    res.status(204).send(order);
  },
);

export { router as deleteOrderRouter };
