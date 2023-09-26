import {
  Publisher,
  Subjects,
  ShowUpdatedEvent,
} from "@tj-movies-ticket/common";

export class ShowUpdatedPublisher extends Publisher<ShowUpdatedEvent> {
  readonly subject = Subjects.SHOW_UPDATED;
}
