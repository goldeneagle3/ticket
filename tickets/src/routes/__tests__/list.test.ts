import request from "supertest";
import { Types } from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket.model";

const url = "/api/tickets";

it("returns lists ", async () => {
  await Ticket.create({
    title: "akjafhaf",
    price: 244,
    userId: "2412414",
  });
  await Ticket.create({
    title: "akjafhaf",
    price: 244,
    userId: "2412414",
  });
  await Ticket.create({
    title: "akjafhaf",
    price: 244,
    userId: "2412414",
  });

  const response = await request(app).get(url).expect(200);

  expect(response.body.length).toEqual(3)

});

// it("returns the ticket if ticket is found", async () => {
//   const ticket = await Ticket.create({
//     title: "akjafhaf",
//     price: 244,
//     userId: "2412414",
//   });

//   const response = await request(app).get(`${url}/${ticket.id}`).expect(200);

//   expect(response.body.title).toEqual("akjafhaf");
// });
