import express from "express";
import mongoose from "mongoose";
import "express-async-errors";
import cookieSession from "cookie-session";

import { middlewares as mw, errors as Err } from "@tj-movies-ticket/common";
import { natsWrapper } from "./nats-wrapper";
import { createFranchiseRouter } from "./routes/new";
import { indexFranchiseRouter } from "./routes";
import { showFranchiseRouter } from "./routes/show";
import { updateFranchiseRouter } from "./routes/update";
import { UserCreatedListener } from "./events/listeners/user-created.listener";

const app = express();

app.set("trust proxy", true);

app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: true,
  }),
);

app.use(mw.currentUser);

app.use(createFranchiseRouter);
app.use(indexFranchiseRouter);
app.use(showFranchiseRouter);
app.use(updateFranchiseRouter);

app.get("*", async () => {
  throw new Err.NotFoundError();
});

app.use(mw.errorHandler);

const start = async () => {
  // check if env variables are defined
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY is not found");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URL is not found");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL is not found");
  }
  if (!process.env.NATS_CLUSTER) {
    throw new Error("NATS_CLUSTER is not found");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID is not found");
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER,
      process.env.NATS_CLIENT_ID, // <-- Client id will be pod id/name
      process.env.NATS_URL,
    );
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed!");
      process.exit();
    });
    process.on("SIGINT", () => natsWrapper.client.close());
    process.on("SIGTERM", () => natsWrapper.client.close());

    new UserCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Franchise app connected to mongodb");
  } catch (error) {
    console.error(error);
  }

  app.listen(3000, () => {
    console.log("Franchise service listening on port", 3000);
  });
};

start();
