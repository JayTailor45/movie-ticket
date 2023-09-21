import express, { Request, Response } from "express";
import { Franchise } from "../models/franchise";

const router = express.Router();

router.get("/api/franchise", async (req: Request, res: Response) => {
  const franchise = await Franchise.find({});
  res.send(franchise);
});

export { router as indexFranchiseRouter };
