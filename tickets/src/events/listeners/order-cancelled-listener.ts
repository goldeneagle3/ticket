import { Listener, OrderCancelledEvent, Subjects } from "@geticketmicro/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket.model";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./QGN";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    // Find the ticket that the order is reseving

    const ticket = await Ticket.findById(data.ticket.id);

    // If ticker not found , throw error

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Mark the ticket as being reserved

    ticket.set({ orderId: undefined });

    // Save the ticket

    await ticket.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    // Ack the msg

    msg.ack();
  }
}
