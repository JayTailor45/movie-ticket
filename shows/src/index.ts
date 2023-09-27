import express from "express";
import mongoose from "mongoose";
import "express-async-errors";
import cookieSession from "cookie-session";

import { middlewares as mw, errors as Err } from "@tj-movies-ticket/common";
import { natsWrapper } from "./nats-wrapper";
import { MovieCreatedListener } from "./events/listeners/movie-created.listener";
import { MovieUpdatedListener } from "./events/listeners/movie-updated.listener";
import { FranchiseCreatedListener } from "./events/listeners/franchise-created.listener";
import { FranchiseUpdatedListener } from "./events/listeners/franchise-updated.listener";
import { showShowRouter } from "./routes/show";
import { createShowRouter } from "./routes/new";
import { updateShowRouter } from "./routes/update";
import { indexShowRouter } from "./routes";

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

app.use(indexShowRouter);
app.use(showShowRouter);
app.use(createShowRouter);
app.use(updateShowRouter);

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

    new MovieCreatedListener(natsWrapper.client).listen();
    new MovieUpdatedListener(natsWrapper.client).listen();

    new FranchiseCreatedListener(natsWrapper.client).listen();
    new FranchiseUpdatedListener(natsWrapper.client).listen();

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
