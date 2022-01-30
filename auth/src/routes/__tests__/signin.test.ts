import request from 'supertest'
import { app } from '../../app'

const route = "/api/users/signin"

it('successfull signin return 201',async () => {
  await request(app).post("/api/users/signup").send({email:'test@test.com',password: 'password'}).expect(201)

  await request(app).post(route).send({email:'test@test.com',password: 'password'}).expect(400)
})

it('invalid email return 422',async () => {
  await request(app).post(route).send({email:'testtest.com',password: 'password'}).expect(422)
})

it('invalid password return 422',async () => {
  await request(app).post(route).send({email:'testtest.com',password: '2r2r'}).expect(422)
})

it('sets cookie after successfull register',async () => {

  await request(app).post("/api/users/signup").send({email:'test@test.com',password: 'password'}).expect(201)

  const response = await request(app).post(route).send({email:'test@test.com',password: 'password'}).expect(200)

  expect(response.get('Set-Cookie')).toBeDefined()
})