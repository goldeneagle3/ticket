import { Message } from "node-nats-streaming";
import { Listener } from "./base-listener";
import {TicketCreatedEvent} from './create-ticket-event'
import { Subjects } from "./subjects";


export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated
  queueGroupName = 'payments-service';

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('Event data!', data);
    
    msg.ack();
  }
}
