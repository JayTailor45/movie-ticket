import mongoose from "mongoose";
import { Password } from "../services/password";
import { enums } from "@tj-movies-ticket/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface UserAttrs {
  email: string;
  password: string;
  city: string;
  username: string;
  gender: enums.UserGender;
  type?: enums.UserType;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  city: string;
  username: string;
  gender: string;
  type: enums.UserType;
  version: number;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(enums.UserType),
      default: enums.UserType.END_USER,
    },
    city: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    // Optional
    gender: {
      type: String,
      required: true,
      enum: Object.values(enums.UserGender),
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const password = this.get("password");
    if (password) {
      const hashed = await Password.toHash(password);
      this.set("password", hashed);
    }
  }
  done();
});

userSchema.set("versionKey", "version");
userSchema.plugin(updateIfCurrentPlugin);

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
