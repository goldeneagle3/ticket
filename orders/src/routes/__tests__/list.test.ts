import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket.model";
import { Order, OrderStatus } from "../../models/order.model";

const url = "/api/orders";
const ticketId = new mongoose.Types.ObjectId().toHexString();

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 246,
  });
  await ticket.save();

  return ticket;
};

it("fetch orders by user", async () => {
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOne = global.signin();
  const userTwo = global.signin();

  const { body: orderOne } = await request(app)
    .post(url)
    .set("Cookie", userOne)
    .send({
      ticketId: ticketOne.id,
    })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post(url)
    .set("Cookie", userTwo)
    .send({
      ticketId: ticketThree.id,
    })
    .expect(201);

  const { body: orderThree } = await request(app)
    .post(url)
    .set("Cookie", userTwo)
    .send({
      ticketId: ticketTwo.id,
    })
    .expect(201);

  const { body } = await request(app)
    .get(url)
    .set("Cookie", userTwo)
    .expect(200);

  expect(body.length).toEqual(2);
  expect(body[1].ticket.price).toEqual(246);
  expect(body[0].ticket.id).toEqual(orderTwo.ticket.id);
});
