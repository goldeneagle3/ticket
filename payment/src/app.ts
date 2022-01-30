import express from "express";
import "express-async-errors";
import { json } from "express";
import cookieParser from "cookie-session";
import { NotFound, errorHandler, currentUser } from "@geticketmicro/common";

import createRoute from "./routes/create.route";

const app = express();

const url = "/api/tickets";

// Middlewares
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieParser({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(currentUser);

// Routes

app.use("/api/payments", createRoute);

// Error Handling
app.all("*", async () => {
  throw new NotFound();
});
app.use(errorHandler);

export { app };
