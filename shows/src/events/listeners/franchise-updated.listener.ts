import {
  Listener,
  Subjects,
  FranchiseUpdatedEvent,
  errors as Err,
} from "@tj-movies-ticket/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Franchise } from "../../models/franchise";

export class FranchiseUpdatedListener extends Listener<FranchiseUpdatedEvent> {
  readonly subject = Subjects.FRANCHISE_UPDATED;
  queueGroupName = queueGroupName;

  async onMessage(data: FranchiseUpdatedEvent["data"], msg: Message) {
    const franchise = await Franchise.findByEvent(data);

    if (!franchise) {
      throw new Err.NotFoundError();
    }

    const { name, description, address, city, version } = data;

    franchise.set({
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
