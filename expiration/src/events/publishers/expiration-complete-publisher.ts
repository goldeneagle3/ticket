import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@geticketmicro/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
