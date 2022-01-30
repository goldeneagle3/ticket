import { NotFound } from "@geticketmicro/common";
import { Router, Request, Response } from "express";

import { Ticket } from "../models/ticket.model";

const router = Router();

router.route("/").get(async (req: Request, res: Response) => {
  const tickets = await Ticket.find({
    orderId: undefined,
  });


  res.status(200).send(tickets);
});

export default router;
