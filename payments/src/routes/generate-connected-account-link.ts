import {
  errors as Err,
  enums as Enums,
  middlewares as md,
} from "@tj-movies-ticket/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { Payment } from "../models/payment";
//   import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/api/payments/generate-connected-account-link",
  md.requireAuth,
  async (req: Request, res: Response) => {
    try {
      const account = await stripe.accounts.create({
        type: "standard",
        country: "India",
        email: req.currentUser?.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        business_profile: {
          mcc: "7922", // Theatrical Ticket Agencies / theatrical_ticket_agencies
          name: req.currentUser?.email,
          product_description: "Movie ticket",
        },
      });

      console.log(account);

      const link = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: "movie-ticket.com/",
        return_url: "movie-ticket.com/",
        type: "account_onboarding",
        collect: "eventually_due",
      });

      console.log("*".repeat(60));

      console.log(link);

      res.send({});
    } catch (e) {
      throw e;
    }
  },
);

export { router as getConnectedAccountLink };
