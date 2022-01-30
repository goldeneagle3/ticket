import request from "supertest";
import { Types } from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket.model";
import { natsWrapper } from "../../nats-wrapper";

const url = "/api/tickets";

it("return 404 if the id not found ", async () => {
  const id = new Types.ObjectId().toHexString();
  await request(app)
    .put(`${url}/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "aafaw",
      price: 14,
    })
    .expect(404);
});

it("return 401 if the user is not authenticated ", async () => {
  await Ticket.create({ title: "aafaw", price: 14, userId: "2412414" });
  const id = new Types.ObjectId().toHexString();
  await request(app)
    .put(`${url}/${id}`)
    .send({
      title: "aafaw",
      price: 14,
    })
    .expect(401);
});

it("return 401 if the user not authorized ", async () => {
  const ticket = await request(app)
    .post(url)
    .set("Cookie", global.signin())
    .send({
      title: "aafaw",
      price: 14,
    })
    .expect(201);
  // const id = new Types.ObjectId().toHexString();
  await request(app)
    .put(`${url}/${ticket.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "aafaw",
      price: 20,
    })
    .expect(401);
});

it("return 422 if the user provide not valid input ", async () => {
  const cookie = global.signin();
  const ticket = await request(app)
    .post(url)
    .set("Cookie", cookie)
    .send({
      title: "aafaw",
      price: 14,
    })
    .expect(201);
  // const id = new Types.ObjectId().toHexString();
  await request(app)
    .put(`${url}/${ticket.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: "414142",
    })
    .expect(422);
});

it("return 400 if the ticket is already reserved ", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post(url)
    .set("Cookie", cookie)
    .send({
      title: "aafaw",
      price: 14,
    })
    .expect(201);

  const ticket = await Ticket.findById(response.body.id);

  ticket?.set({ orderId: "dajdajk" });
  await ticket?.save();

  await request(app)
    .put(`${url}/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "aafaw",
      price: 1231,
    })
    .expect(400);
});

it("return 200 if the user is valid and provide not valid input ", async () => {
  const cookie = global.signin();
  const ticket = await request(app)
    .post(url)
    .set("Cookie", cookie)
    .send({
      title: "aafaw",
      price: 14,
    })
    .expect(201);

  const { body } = await request(app)
    .put(`${url}/${ticket.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "aafaw",
      price: 1231,
    })
    .expect(200);

  expect(body.price).toEqual(1231);
  expect(body.title).toEqual("aafaw");
});

it("return shows the publishing event", async () => {
  const cookie = global.signin();
  const ticket = await request(app)
    .post(url)
    .set("Cookie", cookie)
    .send({
      title: "aafaw",
      price: 14,
    })
    .expect(201);

  await request(app)
    .put(`${url}/${ticket.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "aafaw",
      price: 1231,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
