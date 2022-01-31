import {
  AuthorizationError,
  BadRequest,
  NotFound,
  OrderStatus,
  requireSignin,
  validationRequest,
} from "@geticketmicro/common";
import { Request, Response, Router } from "express";
import { body } from "express-validator";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { Order } from "../models/order.model";
import { Payment } from "../models/payment.model";
import { natsWrapper } from "../nats-wrapper";
import { stripe } from "../stripe";

const router = Router();

router
  .route("/")
  .post(
    requireSignin,
    [body("orderId").not().isEmpty(), body("token").not().isEmpty()],
    validationRequest,
    async (req: Request, res: Response) => {
      const order = await Order.findById(req.body.orderId);

      if (!order) {
        throw new NotFound();
      }

      if (order?.userId !== req.currentUser!.id) {
        throw new AuthorizationError();
      }

      if (order.status === OrderStatus.Cancelled) {
        throw new BadRequest("Order was cancelled!");
      }

      const { id } = await stripe.charges.create({
        currency: "usd",
        amount: order.price * 100,
        source: req.body.token,
      });

      const payment = Payment.build({
        orderId: req.body.orderId,
        stripeId: id,
      });

      await payment.save();
      new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId,
      });

      res.status(201).send({ id: payment.id });
    }
  );

export default router;
