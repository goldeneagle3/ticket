import { OrderCancelledEvent, OrderStatus } from "@geticketmicro/common";
import { Types } from "mongoose";
import { Ticket } from "../../../models/ticket.model";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  // Create an Instance of the Listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create and save listener

  const orderId = new Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    title: "concert",
    price: 80,
    userId: "fadkakjdajkd",
  });

  ticket.set({ orderId });

  await ticket.save();

  // Create the fake data event

  const data: OrderCancelledEvent["data"] = {
    id: new Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, orderId, data, msg };
};

it("update the ticket,publish an event and, acks the message", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updtTicket = await Ticket.findById(ticket.id);

  expect(updtTicket?.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
