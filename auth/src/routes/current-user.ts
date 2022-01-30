import express from 'express'
import jwt from 'jsonwebtoken'
import { currentUser } from '@geticketmicro/common';

const router = express.Router()

router.get('/currentuser',currentUser, (req,res)=> {
  res.send({currentUser: req.currentUser || null })

})


export {router as currentUserRouter};