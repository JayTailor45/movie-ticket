import {
  ShowCreatedEvent,
  Publisher,
  Subjects,
} from "@tj-movies-ticket/common";

export class ShowCreatedPublisher extends Publisher<ShowCreatedEvent> {
  readonly subject = Subjects.SHOW_CREATED;
}
