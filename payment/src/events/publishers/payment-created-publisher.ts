import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from "@geticketmicro/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
