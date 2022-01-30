import express from "express";
import "express-async-errors";
import { json } from "express";
import cookieParser from "cookie-session";
import { NotFound, errorHandler,currentUser } from "@geticketmicro/common";

import createTicket from './routes/create.routes'
import readTicket from './routes/read.routes'
import listTickets from './routes/list.routes'
import updateRoutes from './routes/update.routes'

const app = express();

const url = "/api/tickets"

// Middlewares
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieParser({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(currentUser)

// Routes

app.use(url,createTicket)
app.use(url,readTicket)
app.use(url,listTickets)
app.use(url,updateRoutes)


// Error Handling
app.all("*", async () => {
  throw new NotFound();
});
app.use(errorHandler);

export { app };
