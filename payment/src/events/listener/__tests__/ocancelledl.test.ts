import { OrderCancelledEvent, OrderStatus } from "@geticketmicro/common";
import { Types } from "mongoose";
import { Order } from "../../../models/order.model";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: "dawdowa",
    version: 0,
  });

  await order.save();

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: new Types.ObjectId().toHexString(),
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it("cancel order with success", async () => {
  const { data, listener, order, msg } = await setup();

  await listener.onMessage(data, msg);

  const updOrder = await Order.findById(order.id);

  expect(updOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { data, listener, order, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
