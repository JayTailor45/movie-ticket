import {
  Listener,
  Subjects,
  FranchiseCreatedEvent,
} from "@tj-movies-ticket/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Franchise } from "../../models/franchise";

export class FranchiseCreatedListener extends Listener<FranchiseCreatedEvent> {
  readonly subject = Subjects.FRANCHISE_CREATED;

  queueGroupName = queueGroupName;

  async onMessage(data: FranchiseCreatedEvent["data"], msg: Message) {
    const { id, name, description, address, city, version } = data;

    const franchise = Franchise.build({
      id,
      name,
      description,
      address,
      city,
      version,
    });

    await franchise.save();

    msg.ack();
  }
}
