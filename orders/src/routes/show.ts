import { errors as Err, middlewares as mw } from "@tj-movies-ticket/common";
import express, { Request, Response } from "express";
import { Order } from "../models/order";

const router = express.Router();

router.get(
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

    res.send(order);
  },
);

export { router as showOrderRouter };