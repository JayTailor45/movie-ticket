import mongoose from "mongoose";
import { enums } from "@tj-movies-ticket/common";
import { ShowDoc } from "./show";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface OrderAttrs {
  userId: string;
  status: enums.OrderStatus;
  expiresAt: Date;
  show: ShowDoc;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  status: enums.OrderStatus;
  expiresAt: Date;
  show: ShowDoc;
  version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(enums.OrderStatus),
      default: enums.OrderStatus.CREATED,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "show",
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>("order", orderSchema);

export { Order };
