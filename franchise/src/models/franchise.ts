import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface FranchiseAttrs {
  name: string;
  description: string;
  address: string;
}

interface FranchiseDoc extends mongoose.Document {
  name: string;
  description: string;
  address: string;
  version: number;
}

interface FranchiseModel extends mongoose.Model<FranchiseAttrs> {
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
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

franchiseSchema.set("versionKey", "version");
franchiseSchema.plugin(updateIfCurrentPlugin);

franchiseSchema.statics.build = (attrs: FranchiseAttrs) => {
  return new Franchise(attrs);
};

const Franchise = mongoose.model<FranchiseAttrs, FranchiseModel>(
  "franchise",
  franchiseSchema
);

export { Franchise };
