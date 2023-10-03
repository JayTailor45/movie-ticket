import {
  OrderCancelledEvent,
  Publisher,
  Subjects,
} from "@tj-movies-ticket/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.ORDER_CANCELLED;
}
