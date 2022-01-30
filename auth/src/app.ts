import express from "express";
import "express-async-errors";
import { json } from "express";
import cookieParser from "cookie-session";
import { NotFound, errorHandler } from "@geticketmicro/common";

import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";

const app = express();

// Middlewares
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieParser({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

app.use("/api/users", currentUserRouter);
app.use("/api/users", signInRouter);
app.use("/api/users", signOutRouter);
app.use("/api/users", signUpRouter);

// Error Handling
app.all("*", async () => {
  throw new NotFound();
});
app.use(errorHandler);

export { app };
