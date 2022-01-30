import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from "@geticketmicro/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
