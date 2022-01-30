import { NotFound } from "@geticketmicro/common";
import { Router, Request, Response } from "express";

import { Ticket } from "../models/ticket.model";

const router = Router();

router.route("/:id").get(async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFound();
  }

  res.status(200).send(ticket);
});

export default router;
