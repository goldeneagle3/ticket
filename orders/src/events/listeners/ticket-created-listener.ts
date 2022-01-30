import { Subjects, Listener, TicketCreatedEvent } from "@geticketmicro/common";
import { Message } from "node-nats-streaming";

import { Ticket } from "../../models/ticket.model";
import { queueGroupName } from "./QGN";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;

  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const { id, title, price } = data;

    const ticket = await Ticket.build({
      id,
      title,
      price,
    });

    await ticket.save();

    msg.ack();
  }
}
