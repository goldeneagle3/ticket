import { requireSignin } from "@geticketmicro/common";
import { Request, Response, Router } from "express";
import { Order } from "../models/order.model";

const router = Router();

router.route("/").get(requireSignin, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  })
    .populate("ticket")
    .exec();

  res.status(200).send(orders);
});

export default router;
