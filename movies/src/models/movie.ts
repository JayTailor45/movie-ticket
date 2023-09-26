import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface MovieAttrs {
  name: string;
  description: string;
  releaseDate: string;
  genres: string[];
  languages: string[];
  director: string;
  actors: string[];
}

interface MovieDoc extends mongoose.Document {
  name: string;
  description: string;
  releaseDate: Date;
  genres: string[];
  languages: string[];
  director: string;
  actors: string[];
  version: number;
}

interface MovieModel extends mongoose.Model<MovieDoc> {
  build(attrs: MovieAttrs): MovieDoc;
}

const movieSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    releaseDate: {
      type: mongoose.Schema.Types.Date,
      require: true,
    },
    genres: {
      type: [String],
      require: true,
      default: [],
    },
    languages: {
      type: [String],
      require: true,
      default: [],
    },
    director: {
      type: String,
      require: true,
    },
    actors: {
      type: [String],
      require: true,
      default: [],
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

movieSchema.set("versionKey", "version");
movieSchema.plugin(updateIfCurrentPlugin);

movieSchema.statics.build = (attrs: MovieAttrs) => {
  return new Movie(attrs);
};

const Movie = mongoose.model<MovieAttrs, MovieModel>("movies", movieSchema);

export { Movie };
