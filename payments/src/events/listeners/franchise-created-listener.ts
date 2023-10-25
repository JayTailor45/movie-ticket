import {
  FranchiseCreatedEvent,
  Listener,
  Subjects,
} from "@tj-movies-ticket/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Franchise } from "../../models/franchise";

export class FranchiseCreatedListener extends Listener<FranchiseCreatedEvent> {
  readonly subject = Subjects.FRANCHISE_CREATED;
  queueGroupName = queueGroupName;

  async onMessage(data: FranchiseCreatedEvent["data"], msg: Message) {
    const order = Franchise.build({
      id: data.id,
      description: data.description,
      name: data.name,
      address: data.address,
      city: data.city,
      version: data.version,
    });

    await order.save();

    msg.ack();
  }
}
