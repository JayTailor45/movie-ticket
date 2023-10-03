import { middlewares as mw } from "@tj-movies-ticket/common";
import express, { Request, Response } from "express";
import { Order } from "../models/order";

const router = express.Router();

router.get(
  "/api/orders",
  mw.requireAuth,
  async (req: Request, res: Response) => {
    const orders = await Order.find({ userId: req.currentUser!.id }).populate(
      "show",
    );
    res.send(orders);
  },
);

export { router as indexOrderRouter };
