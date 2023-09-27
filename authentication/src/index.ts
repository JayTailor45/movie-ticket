import express from "express";
import mongoose from "mongoose";
import "express-async-errors";
import cookieSession from "cookie-session";

import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/sign-in";
import { signOutRouter } from "./routes/sign-out";
import { signUpRouter } from "./routes/sign-up";
import { errors as Err, middlewares as mw } from "@tj-movies-ticket/common/";
import { natsWrapper } from "./nats-wrapper";
import { FranchiseCreatedListener } from "./events/listeners/franchise-created.listener";

const app = express();

app.set("trust proxy", true);

app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: true,
  }),
);

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

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
    throw new Error("MONGO_URI is not found");
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

    new FranchiseCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Authentication app connected to mongodb");
  } catch (error) {
    console.error(error);
  }

  app.listen(3000, () => {
    console.log("Authentication service listening on port", 3000);
  });
};

start();
