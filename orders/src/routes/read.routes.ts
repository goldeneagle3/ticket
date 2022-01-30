import {
  AuthorizationError,
  NotFound,
  requireSignin,
} from "@geticketmicro/common";
import { Request, Response, Router } from "express";
import { Order } from "../models/order.model";

const router = Router();

router
  .route("/:orderId")
  .get(requireSignin, async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("ticket").exec();

    if (!order) {
      throw new NotFound();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new AuthorizationError();
    }

    res.status(200).send(order);
  });

export default router;
