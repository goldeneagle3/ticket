import {
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from "@geticketmicro/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order.model";
import { queueGroupName } from "./QGN";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({ status: OrderStatus.Complete });

    await order.save();

    msg.ack();
  }
}
