import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@geticketmicro/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order.model";
import { queueGroupName } from "./QGN";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const { id, ticket, status, userId, version } = data;
    const order = await Order.build({
      id,
      status,
      userId,
      version,
      price: ticket.price,
    });

    await order.save();

    msg.ack();
  }
}
