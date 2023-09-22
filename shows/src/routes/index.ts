import express, { Request, Response } from "express";
import { Show } from "../models/show";

const router = express.Router();

router.get("/api/shows", async (req: Request, res: Response) => {
  const show = await Show.find({});
  res.send(show);
});

export { router as indexShowRouter };
