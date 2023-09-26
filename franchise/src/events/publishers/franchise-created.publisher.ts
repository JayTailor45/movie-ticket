import {
  FranchiseCreatedEvent,
  Publisher,
  Subjects,
} from "@tj-movies-ticket/common";

export class FranchiseCreatedPublisher extends Publisher<FranchiseCreatedEvent> {
  readonly subject = Subjects.FRANCHISE_CREATED;
}
