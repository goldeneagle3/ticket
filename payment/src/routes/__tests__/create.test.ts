import { OrderStatus } from "@geticketmicro/common";
import { Types } from "mongoose";
import request from "supertest";

import { app } from "../../app";
import { Order, OrderAttrs } from "../../models/order.model";
import { Payment } from "../../models/payment.model";
import { stripe } from "../../stripe";

jest.mock("../../stripe");

const orderPayload: OrderAttrs = {
  id: new Types.ObjectId().toHexString(),
  version: 0,
  userId: new Types.ObjectId().toHexString(),
  price: 421,
  status: OrderStatus.Created,
};

it("return 404 if the order is not found", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({ token: "token", orderId: new Types.ObjectId().toHexString() })
    .expect(404);
});

it("return 401 if the user is not the owner of order", async () => {
  const order = Order.build(orderPayload);

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({ token: "token", orderId: order.id })
    .expect(401);
});

it("return 400 if the order status is Cancelled", async () => {
  const userId = new Types.ObjectId().toHexString();
  const order = Order.build({
    ...orderPayload,
    status: OrderStatus.Cancelled,
    userId: userId,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({ token: "token", orderId: order.id })
    .expect(400);
});

it("return 200 with valid inputs", async () => {
  const userId = new Types.ObjectId().toHexString();
  const order = Order.build({
    ...orderPayload,
    userId: userId,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({ token: "tok_visa", orderId: order.id })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

  expect(chargeOptions.source).toEqual("tok_visa");
  expect(chargeOptions.amount).toEqual(421 * 100);

});
