import {
  Listener,
  OrderCancelledEvent,
  errors as Err,
  enums as Enums,
  Subjects,
} from "@tj-movies-ticket/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.ORDER_CANCELLED;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Err.NotFoundError();
    }

    order.set({
      status: Enums.OrderStatus.CANCELLED,
    });

    await order.save();

    msg.ack();
  }
}
