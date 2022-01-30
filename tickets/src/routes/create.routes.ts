import express, { Request, Response } from "express";
import { requireSignin, validationRequest } from "@geticketmicro/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket.model";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

router
  .route("/")
  .post(
    requireSignin,
    [
      body("title").isString(),
      body("title").not().isEmpty().withMessage("Where title?"),
      body("price").not().isEmpty(),
      body("price").isFloat({ min: 0 }),
    ],
    validationRequest,
    async (req: Request, res: Response) => {
      const { title, price } = req.body;

      const ticket = Ticket.build({
        title,
        price,
        userId: req.currentUser!.id,
      });
      await ticket.save();
      new TicketCreatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        version: ticket.version,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
      });

      res.status(201).send(ticket);
    }
  );

export default router;
