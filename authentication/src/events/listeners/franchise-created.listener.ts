import {
  Listener,
  Subjects,
  FranchiseCreatedEvent,
} from "@tj-movies-ticket/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { User } from "../../models/user";
import { UserType } from "@tj-movies-ticket/common/build/enums";

export class FranchiseCreatedListener extends Listener<FranchiseCreatedEvent> {
  readonly subject = Subjects.FRANCHISE_CREATED;

  queueGroupName = queueGroupName;

  async onMessage(data: FranchiseCreatedEvent["data"], msg: Message) {
    const { user: userId } = data;

    const user = await User.findById({ userId });

    if (user) {
      user.set({ type: user ? UserType.FRANCHISE_USER : UserType.END_USER });
      await user.save();
    }

    msg.ack();
  }
}
