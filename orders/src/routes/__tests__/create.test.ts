import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket.model";
import { Order, OrderStatus } from "../../models/order.model";
import { natsWrapper } from "../../nats-wrapper";

const url = "/api/orders";
const ticketId = new mongoose.Types.ObjectId();

it("return 404 if ticket is not found", async () => {
  await request(app)
    .post(url)
    .set("Cookie", global.signin())
    .send({
      ticketId,
    })
    .expect(404);
});

it("return 409 if ticket is reserved", async () => {
  const ticket = Ticket.build({
    id: ticketId.toHexString(),
    title: "concert",
    price: 246,
  });
  await ticket.save();
  const order = Order.build({
    ticket: ticket,
    status: OrderStatus.Created,
    userId: "dhwadjwajaf",
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post(url)
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(409);
});

it("return 201 if order is created with success", async () => {
  const ticket = Ticket.build({
    id: ticketId.toHexString(),
    title: "concert",
    price: 246,
  });
  await ticket.save();

  await request(app)
    .post(url)
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
});

it("emits an order created event", async () => {
  const ticket = Ticket.build({
    id: ticketId.toHexString(),
    title: "concert",
    price: 246,
  });
  await ticket.save();

  await request(app)
    .post(url)
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
