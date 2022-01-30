import mongoose from "mongoose";

import { app } from "./app";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("key not found!");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGODB URI not found!");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDb");
    app.listen(3000, () => console.log("Hello from Auth Service"));
  } catch (error) {
    console.log(error);
  }
};

start();
