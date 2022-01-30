import { Listener, OrderCreatedEvent, Subjects } from "@geticketmicro/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expiration-queue";
import { queueGroupName } from "./QGN";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

    console.log("Waiting to process for this " + delay + " milliseconds");

    await expirationQueue.add({ orderId: data.id }, { delay });

    msg.ack();
  }
}
