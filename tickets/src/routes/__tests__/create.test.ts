import request from "supertest";

import { app } from "../../app";
import { Ticket } from "../../models/ticket.model";
import { natsWrapper } from "../../nats-wrapper";

const url = "/api/tickets";

it("has a route handler for POST", async () => {
  const { statusCode } = await request(app).post(url).send({});

  expect(statusCode).not.toEqual(404);
});

it("check if user is signed in", async () => {
  await request(app).post(url).send({}).expect(401);
});

it("return not 401 if user signed in", async () => {
  const response = await request(app)
    .post(url)
    .set("Cookie", global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it("check validity of title", async () => {
  await request(app)
    .post(url)
    .set("Cookie", global.signin())
    .send({
      title: "",
      price: 42,
    })
    .expect(422);

  await request(app)
    .post(url)
    .set("Cookie", global.signin())
    .send({
      price: 42,
    })
    .expect(422);
});

it("check validity of price", async () => {
  await request(app)
    .post(url)
    .set("Cookie", global.signin())
    .send({
      title: "jfhawhjfa",
      price: -42,
    })
    .expect(422);

  await request(app)
    .post(url)
    .set("Cookie", global.signin())
    .send({
      title: "afafasf",
    })
    .expect(422);
});

it("check validity of inputs", async () => {
  await request(app)
    .post(url)
    .set("Cookie", global.signin())
    .send({})
    .expect(422);
});

it("save to db if process is valid", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await Ticket.create({
    title: "akjafhaf",
    price: 244,
    userId: "2412414",
  });

  let tickets2 = await Ticket.find({});
  expect(tickets2.length).toEqual(1);

  // await request(app)
  //   .post(url)
  //   .set("Cookie", global.signin())
  //   .send({
  //     title: "akjafhaf",
  //     price: 244,
  //   })
  //   .expect(201);
});

it("return 201 if process is valid", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post(url)
    .set("Cookie", global.signin())
    .send({
      title: "akjafhaf",
      price: 244,
    })
    .expect(201);

  let tickets2 = await Ticket.find({});
  expect(tickets2.length).toEqual(1);
});

it("return shows the publishing event", async () => {
  await request(app)
    .post(url)
    .set("Cookie", global.signin())
    .send({
      title: "akjafhaf",
      price: 244,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled()
});
