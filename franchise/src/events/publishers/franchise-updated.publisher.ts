import {
  Publisher,
  Subjects,
  FranchiseUpdatedEvent,
} from "@tj-movies-ticket/common";

export class FranchiseUpdatedPublisher extends Publisher<FranchiseUpdatedEvent> {
  readonly subject = Subjects.FRANCHISE_UPDATED;
}
