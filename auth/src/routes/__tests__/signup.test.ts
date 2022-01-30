import request from 'supertest'
import { app } from '../../app'


it('successfull signup return 201',async () => {
  await request(app).post("/api/users/signup").send({email:'test@test.com',password: 'password'}).expect(201)
})

it('invalid email return 422',async () => {
  await request(app).post("/api/users/signup").send({email:'testtest.com',password: 'password'}).expect(422)
})

it('invalid password return 422',async () => {
  await request(app).post("/api/users/signup").send({email:'testtest.com',password: '2r2r'}).expect(422)
})

it('409 email duplicate error',async () => {

  await request(app).post("/api/users/signup").send({email:'test@test.com',password: '2r2fwafwafawr'}).expect(201)

  await request(app).post("/api/users/signup").send({email:'test@test.com',password: '2r2fwafwafawr'}).expect(409)
})

it('sets cookie after successfull register',async () => {

  const response = await request(app).post("/api/users/signup").send({email:'test@test.com',password: '2r2fwafwafawr'}).expect(201)

  expect(response.get('Set-Cookie')).toBeDefined()
})