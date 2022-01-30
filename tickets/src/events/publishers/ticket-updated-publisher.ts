import { Publisher, Subjects, TicketUpdatedEvent } from "@geticketmicro/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
