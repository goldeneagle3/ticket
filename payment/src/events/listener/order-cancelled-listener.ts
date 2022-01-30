import {
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from "@geticketmicro/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order.model";
import { queueGroupName } from "./QGN";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const order = await Order.findOne({
      id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error("Order not found!");
    }

    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();

    msg.ack();
  }
}
