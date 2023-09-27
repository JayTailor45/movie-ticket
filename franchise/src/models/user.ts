import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface UserAttrs {
  id: string;
  email: string;
  version: number;
}

export interface UserDoc extends mongoose.Document {
  email: string;
  version: number;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema(
  {
    email: {
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

userSchema.set("versionKey", "version");
userSchema.plugin(updateIfCurrentPlugin);

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserAttrs, UserModel>("users", userSchema);

export { User };
