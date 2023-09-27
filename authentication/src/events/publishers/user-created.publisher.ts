import {
  Publisher,
  Subjects,
  UserCreatedEvent,
} from "@tj-movies-ticket/common";

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  readonly subject = Subjects.USER_CREATED;
}
