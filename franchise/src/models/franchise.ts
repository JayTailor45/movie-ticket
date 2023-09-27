import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { UserDoc } from "./user";

interface FranchiseAttrs {
  name: string;
  description: string;
  address: string;
  city: string;
  user: UserDoc;
}

interface FranchiseDoc extends mongoose.Document {
  name: string;
  description: string;
  address: string;
  city: string;
  version: number;
  user: UserDoc;
}

interface FranchiseModel extends mongoose.Model<FranchiseDoc> {
  build(attrs: FranchiseAttrs): FranchiseDoc;
}

const franchiseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    address: {
      type: String,
      require: true,
    },
    city: {
      type: String,
      require: true,
    },
    user: {
      require: false,
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
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

franchiseSchema.set("versionKey", "version");
franchiseSchema.plugin(updateIfCurrentPlugin);

franchiseSchema.statics.build = (attrs: FranchiseAttrs) => {
  return new Franchise(attrs);
};

const Franchise = mongoose.model<FranchiseAttrs, FranchiseModel>(
  "franchise",
  franchiseSchema,
);

export { Franchise };
