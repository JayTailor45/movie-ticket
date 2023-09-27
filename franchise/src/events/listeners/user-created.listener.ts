import { Listener, Subjects, UserCreatedEvent } from "@tj-movies-ticket/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { User } from "../../models/user";

export class UserCreatedListener extends Listener<UserCreatedEvent> {
  readonly subject = Subjects.USER_CREATED;

  queueGroupName = queueGroupName;

  async onMessage(data: UserCreatedEvent["data"], msg: Message) {
    const { id, email, version } = data;

    const user = User.build({
      id,
      email,
      version,
    });

    await user.save();

    msg.ack();
  }
}
