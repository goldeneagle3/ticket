import mongoose, { MongooseOptions } from "mongoose";
import { Password } from "../utils/hashPassword";

// An Interface that describe the properties that are
// Required to create a new User

export interface IUser {
  email: string;
  password: string;
}

//  An Interface that desc props that a user model has
export interface UserModel extends mongoose.Model<UserDocument> {
  build(attrs: IUser): UserDocument;
}

// An interface that desc props that desc a User Document has
export interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
}

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

UserSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

UserSchema.statics.build = (attrs: IUser) => {
  return new User(attrs);
};

const User = mongoose.model<UserDocument, UserModel>("User", UserSchema);

export { User };
