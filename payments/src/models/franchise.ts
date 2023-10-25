import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface FranchiseAttrs {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  stripeAccountId?: string;
  version: number;
}

export interface FranchiseDoc extends mongoose.Document {
  name: string;
  description: string;
  address: string;
  city: string;
  stripeAccountId?: string;
  version: number;
}

interface FranchiseModel extends mongoose.Model<FranchiseDoc> {
  build(attrs: FranchiseAttrs): FranchiseDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<FranchiseDoc | null>;
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
    stripeAccountId: {
      type: String,
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

franchiseSchema.statics.findByEvent = (event: {
  id: string;
  version: number;
}) => {
  return Franchise.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

franchiseSchema.statics.build = (attrs: FranchiseAttrs) => {
  return new Franchise(attrs);
};

const Franchise = mongoose.model<FranchiseAttrs, FranchiseModel>(
  "franchise",
  franchiseSchema,
);

export { Franchise };
