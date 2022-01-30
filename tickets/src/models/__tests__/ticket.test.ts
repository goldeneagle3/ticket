import { Ticket } from "../ticket.model";

it('implements Optimistic Concurrency Control',async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '3252352',
  })

  await ticket.save()

  const firstIns = await Ticket.findById(ticket.id)
  const secondInst = await Ticket.findById(ticket.id)

  firstIns?.set({price:10})
  secondInst?.set({price:15})

  await firstIns?.save()

  try {
    await secondInst?.save() 
  } catch (error) {
    return    
  }

  throw new Error("Should not reach this point.");
  
})


it('inc the version number on multiple saves',async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '3252352',
  })

  await ticket.save()
  expect(ticket.version).toEqual(0)

  await ticket.save()
  expect(ticket.version).toEqual(1)

  await ticket.save()
  expect(ticket.version).toEqual(2)

  await ticket.save()
  expect(ticket.version).toEqual(3)
  
})




// save the second fetched ticket and expect an error
// try {
//   await secondInstance!.save();
// } catch (err) {
//   return;
// }