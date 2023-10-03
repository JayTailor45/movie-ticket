import mongoose from "mongoose";
import { Order } from "./order";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import { enums } from "@tj-movies-ticket/common";

interface ShowAttrs {
  id: string;
  movie: string;
  price: number;
}

export interface ShowDoc extends mongoose.Document {
  movie: string;
  price: number;
  version: number;
  // isReserved(): Promise<boolean>;
}

interface ShowModel extends mongoose.Model<ShowDoc> {
  build(attrs: ShowAttrs): ShowDoc;
  findByEvent(event: { id: string; version: number }): Promise<ShowDoc | null>;
}

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 100,
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

showSchema.set("versionKey", "version");
showSchema.plugin(updateIfCurrentPlugin);

showSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Show.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

showSchema.statics.build = (attrs: ShowAttrs) => {
  const { id, ...rest } = attrs;
  return new Show({
    _id: id,
    ...rest,
  });
};

// showSchema.methods.isReserved = async function () {
//   const existingOrder = await Order.findOne({
//     ticket: this,
//     status: {
//       $in: [
//         enums.OrderStatus.CREATED,
//         enums.OrderStatus.AWAITING_PAYMENT,
//         enums.OrderStatus.COMPLETED,
//       ],
//     },
//   });
//   return !!existingOrder;
// };

const Show = mongoose.model<ShowDoc, ShowModel>("show", showSchema);

export { Show };
