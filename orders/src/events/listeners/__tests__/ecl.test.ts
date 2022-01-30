import { ExpirationCompleteEvent, OrderStatus } from "@geticketmicro/common";
import { Types } from "mongoose";
import { Order } from "../../../models/order.model";
import { Ticket } from "../../../models/ticket.model";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listeners";

const setup = async () => {
  // Create an instance of the listener
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  await ticket.save();

  // Create and save a order
  const order = Order.build({
    status: OrderStatus.Created,
    userId: "r3rarwar",
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  // Create a fake data event
  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  // Create a fake message object

  // @ts-ignore
  const message: Message = {
    ack: jest.fn(),
  };

  return { listener, data, message, order, ticket };
};

it("updates the order status to Cancelled", async () => {
  const { listener, data, order, message } = await setup();

  await listener.onMessage(data, message);

  const updateOrder = await Order.findById(order.id);
  const updtTicket = await Ticket.findById(order.ticket.id);

  expect(updateOrder?.status).toEqual(OrderStatus.Cancelled);
  expect(updtTicket?.id).not.toEqual(updateOrder?.ticket.id);
});

it("emit an OrderCancelled event", async () => {
  const { listener, order, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  console.log(eventData);
  expect(eventData.id).toEqual(order.id);
});

it("ack the message", async () => {
  const { listener, data, message } = await setup();

  await listener.onMessage(data, message);

  expect(message.ack).toHaveBeenCalled();
});
