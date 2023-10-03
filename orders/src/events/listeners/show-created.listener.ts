import { Listener, Subjects, ShowCreatedEvent } from "@tj-movies-ticket/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Show } from "../../models/show";

export class ShowCreatedListener extends Listener<ShowCreatedEvent> {
  readonly subject = Subjects.SHOW_CREATED;

  queueGroupName = queueGroupName;

  async onMessage(data: ShowCreatedEvent["data"], msg: Message) {
    const { id, movie, price } = data;

    const show = Show.build({
      id,
      movie,
      price,
    });
    await show.save();

    msg.ack();
  }
}
