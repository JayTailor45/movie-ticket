import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { MovieDoc } from "./movie";
import { FranchiseDoc } from "./franchise";

interface ShowAttrs {
  price: number;
  capacity: number;
  startTime: Date;
  endTime: Date;
  movie: MovieDoc;
  franchise: FranchiseDoc;
}

interface ShowDoc extends mongoose.Document {
  price: number;
  capacity: number;
  startTime: Date;
  endTime: Date;
  movie: MovieDoc;
  franchise: FranchiseDoc;
  version: number;
}

interface ShowModel extends mongoose.Model<ShowDoc> {
  build(attrs: ShowAttrs): ShowDoc;
}

const showSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      require: true,
      min: 100,
    },
    capacity: {
      type: Number,
      require: true,
    },
    startTime: {
      type: mongoose.Schema.Types.Date,
      require: true,
    },
    endTime: {
      type: mongoose.Schema.Types.Date,
      require: true,
    },
    franchise: {
      require: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "franchise",
    },
    movie: {
      require: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "movies",
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

showSchema.statics.build = (attrs: ShowAttrs) => {
  return new Show(attrs);
};

const Show = mongoose.model<ShowAttrs, ShowModel>("shows", showSchema);

export { Show };
