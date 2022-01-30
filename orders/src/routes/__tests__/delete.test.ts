import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket.model";
import { Order, OrderStatus } from "../../models/order.model";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";

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
    .delete(`${url}/${orderId}`)
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

  await request(app)
    .delete(`${url}/${orderOne.id}`)
    .set("Cookie", userTwo)
    .expect(401);
});

it("marks an order as cancelled", async () => {
  // create a ticket with Ticket Model
  const ticket = Ticket.build({
    id: ticketId,
    title: "concert",
    price: 20,
  });
  await ticket.save();

  const user = global.signin();
  // make a request to create an order
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  // expectation to make sure the thing is cancelled
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits a order cancelled event", async () => {
  // create a ticket with Ticket Model
  const ticket = Ticket.build({
    id: ticketId,
    title: "concert",
    price: 20,
  });
  await ticket.save();

  const user = global.signin();
  // make a request to create an order
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  // expectation to make sure the thing is cancelled
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
