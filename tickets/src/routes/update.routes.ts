import {
  AuthorizationError,
  BadRequest,
  NotFound,
  requireSignin,
  validationRequest,
} from "@geticketmicro/common";
import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";

import { Ticket } from "../models/ticket.model";
import { natsWrapper } from "../nats-wrapper";

const router = Router();

router
  .route("/:id")
  .put(
    requireSignin,
    [
      body("title").isString(),
      body("title").not().isEmpty().withMessage("Where title?"),
      body("price").not().isEmpty(),
      body("price").isFloat({ min: 0 }),
    ],
    validationRequest,
    async (req: Request, res: Response) => {
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        throw new NotFound();
      }

      if (ticket.orderId) {
        throw new BadRequest("This ticket is already reserved!");
      }

      if (ticket.userId !== req.currentUser!.id) {
        throw new AuthorizationError();
      }

      const updateTicket = await Ticket.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        version: ticket.version,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
      });

      res.status(200).send(updateTicket);
    }
  );

export default router;
