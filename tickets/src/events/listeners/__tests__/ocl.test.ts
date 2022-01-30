import { OrderCreatedEvent, OrderStatus } from "@geticketmicro/common";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket.model";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";

const setup = async () => {
  // Create an Instance of the Listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save listener

  const ticket = Ticket.build({
    title: "concert",
    price: 80,
    userId: "fadkakjdajkd",
  });

  await ticket.save();

  // Create the fake data event

  const data: OrderCreatedEvent["data"] = {
    id: new Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: "hdagfhagwfja",
    expiresAt: "weefs",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("sets the userId of the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const updtData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  console.log(updtData);
  expect(data.id).toEqual(updtData.orderId);
});
