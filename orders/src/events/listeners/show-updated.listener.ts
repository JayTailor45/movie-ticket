import {
  Listener,
  Subjects,
  errors as Err,
  ShowUpdatedEvent,
} from "@tj-movies-ticket/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Show } from "../../models/show";

export class ShowUpdatedListener extends Listener<ShowUpdatedEvent> {
  readonly subject = Subjects.SHOW_UPDATED;
  queueGroupName = queueGroupName;

  async onMessage(data: ShowUpdatedEvent["data"], msg: Message) {
    const show = await Show.findByEvent(data);

    if (!show) {
      throw new Err.NotFoundError();
    }

    const { movie, price } = data;
    show.set({ movie, price });
    await show.save();

    msg.ack();
  }
}
