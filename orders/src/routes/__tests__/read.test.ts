import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket.model";
import { Order, OrderStatus } from "../../models/order.model";

const url = "/api/orders";
const ticketId = new mongoose.Types.ObjectId().toHexString();


const buildTicket = async () => {
  const ticket = Ticket.build({
    id: ticketId,
    title: "concert",
    price: 246,
  });
  await ticket.save();

  return ticket;
};

const orderId = new mongoose.Types.ObjectId();

it("return 404 if order is not found", async () => {
  await request(app)
    .get(`${url}/${orderId}`)
    .set("Cookie", global.signin())
    .expect(404);
});

it("return 401 if order is not owned by user who request the order", async () => {
  const ticket = await buildTicket();

  const userOne = global.signin();
  const userTwo = global.signin();

  const { body: orderOne } = await request(app)
    .post(url)
    .set("Cookie", userOne)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const response = await request(app)
    .get(`${url}/${orderOne.id}`)
    .set("Cookie", userTwo)
    .expect(401);
});

it("return 200 and fetch order with success", async () => {
  const ticket = await buildTicket();

  const userOne = global.signin();

  const { body: orderOne } = await request(app)
    .post(url)
    .set("Cookie", userOne)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const { body } = await request(app)
    .get(`${url}/${orderOne.id}`)
    .set("Cookie", userOne)
    .expect(200);

  expect(body.ticket.price).toEqual(246);
});
