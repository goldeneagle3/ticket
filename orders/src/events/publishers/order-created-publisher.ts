import { Publisher, OrderCreatedEvent, Subjects } from "@geticketmicro/common";


export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
}