import {
  AuthorizationError,
  NotFound,
  OrderStatus,
  requireSignin,
} from "@geticketmicro/common";
import { Request, Response, Router } from "express";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { Order } from "../models/order.model";
import { natsWrapper } from "../nats-wrapper";

const router = Router();

router
  .route("/:orderId")
  .delete(requireSignin, async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("ticket").exec();

    if (!order) {
      throw new NotFound();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new AuthorizationError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  });

export default router;
