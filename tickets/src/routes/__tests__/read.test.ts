import request from "supertest";
import { Types } from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket.model";

const url = "/api/tickets";

it("returns 404 if ticket is not found", async () => {
  const id = new Types.ObjectId().toHexString();
  await request(app).get(`${url}/${id}`).expect(404)
});

it("returns the ticket if ticket is found", async () => {
  const ticket = await Ticket.create({
    title: "akjafhaf",
    price: 244,
    userId: "2412414",
  });

  const response = await request(app).get(`${url}/${ticket.id}`).expect(200);

  expect(response.body.title).toEqual("akjafhaf");
});
