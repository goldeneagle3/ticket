import {
  DuplicateErrors,
  NotFound,
  OrderStatus,
  requireSignin,
  validationRequest,
} from "@geticketmicro/common";
import { Request, Response, Router } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { Order } from "../models/order.model";
import { Ticket } from "../models/ticket.model";
import { natsWrapper } from "../nats-wrapper";

const router = Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.route("/").post(
  requireSignin,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided."),
  ],
  validationRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // Find the ticket in db

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFound();
    }

    // Make sure ticket is not reserver

    const isReserved = await ticket.isReserved();

    if (isReserved) {
      throw new DuplicateErrors();
    }

    // Calculate expiration date for icket

    const expiration = new Date();

    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order save it to db

    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: ticket,
    });

    await order.save();

    // Publish an event that says order was created

    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export default router;
