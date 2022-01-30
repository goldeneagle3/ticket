import mongoose from "mongoose";
import { TicketCreatedEvent } from "@geticketmicro/common";

import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listener";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket.model";

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // Create a fake data event
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // Create a fake message object

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message };
};

it("creates and saves a ticket", async () => {
  const { listener, data, message } = await setup();

  // call the onMessage func with the data object + message object
  await listener.onMessage(data, message);

  // Write assertions to make sure a ticket was created!
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket?.title).toEqual("concert");
  expect(ticket?.price).toEqual(10);
});

it("ack the message", async () => {
  const { listener, data, message } = await setup();

  // call the onMessage func with the data object + message object

  await listener.onMessage(data, message);

  // Write assertions to make sure ack fn is called

  expect(message.ack).toHaveBeenCalled();
});
