import express from "express";
import "express-async-errors";
import { json } from "express";
import cookieParser from "cookie-session";
import { NotFound, errorHandler, currentUser } from "@geticketmicro/common";

// Routes Importing
import listRouter from "./routes/list.routes";
import readRouter from "./routes/read.routes";
import createRouter from "./routes/create.routes";
import deleteRouter from "./routes/delete.routes";

const app = express();

const url = "/api/orders";

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
app.use(url, listRouter);
app.use(url, readRouter);
app.use(url, createRouter);
app.use(url, deleteRouter);

// Error Handling
app.all("*", async () => {
  throw new NotFound();
});
app.use(errorHandler);

export { app };
