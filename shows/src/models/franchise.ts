import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface FranchiseAttrs {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  version: number;
}

export interface FranchiseDoc extends mongoose.Document {
  name: string;
  description: string;
  address: string;
  city: string;
  version: number;
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
