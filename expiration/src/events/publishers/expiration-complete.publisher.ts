import { ExpirationCompleteEvent, Publisher, Subjects } from "@tj-movies-ticket/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.EXPIRATION_COMPLETE;
}
