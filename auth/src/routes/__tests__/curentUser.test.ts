import request from "supertest";
import { app } from "../../app";

const route = "/api/users/currentuser";

it("return user with success", async () => {
  const cookie = await global.signin()

  const user = await request(app).get(route).set("Cookie", cookie).expect(200);

  expect(user.body.currentUser.email).toBe('test@test.com');
});

it("return empty body with no auth", async () => {
  const user = await request(app).get(route).expect(200);

  expect(user.body.currentUser).toBeFalsy();
});
