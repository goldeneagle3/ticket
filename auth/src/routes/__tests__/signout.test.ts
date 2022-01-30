import request from "supertest";
import { app } from "../../app";

const route = "/api/users/signout";

it("clears cookie after successfull register and login", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "test@test.com", password: "password" })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({ email: "test@test.com", password: "password" })
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();

  const so = await request(app).post(route);

  expect(so.get("Set-Cookie")).toContain(
    "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
  );
});
