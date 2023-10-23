import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from "@tj-movies-ticket/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PAYMENT_CREATED;
}
