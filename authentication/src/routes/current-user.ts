import express from "express";
import jwt from "jsonwebtoken";
import { middlewares as mw } from "@tj-movies-ticket/common";

const router = express.Router();

router.get("/api/users/currentuser", mw.currentUser, (req, res) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
