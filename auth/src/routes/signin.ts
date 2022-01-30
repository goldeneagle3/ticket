import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import {validationRequest,BadRequest} from '@geticketmicro/common'


import { User } from "../models/user.model";
import { Password } from "../utils/hashPassword";

const router = express.Router();

router.post(
  "/signin",
  [
    body("email").isEmail().withMessage("Email error"),
    body("password")
      .notEmpty()
      .trim()
      .isString()
      .isLength({ min: 6, max: 32 })
      .withMessage("password error"),
  ],
  validationRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const isExists = await User.findOne({ email });
    if (!isExists) {
      throw new BadRequest("Wrong credentials");
    }

    const comparePass = await Password.compare(isExists.password, password);

    if(!comparePass){
      throw new BadRequest("Wrong credentials");
    }

    // Generate JWT
    const userJwt = await jwt.sign(
      { id: isExists.id, email: isExists.email },
      process.env.JWT_KEY!
    );

    // store it in store
    req.session = {
      jwt: userJwt,
    };

    res.status(200).send(isExists);

  }
);

export { router as signInRouter };
