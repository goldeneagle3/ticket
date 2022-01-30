import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { DuplicateErrors, validationRequest } from "@geticketmicro/common";

import { User } from "../models/user.model";

const router = express.Router();

router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Email error"),
    body("password")
      .trim()
      .isString()
      .isLength({ min: 6, max: 32 })
      .withMessage("password error"),
  ],
  validationRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const isExists = await User.findOne({ email });
    if (isExists) {
      throw new DuplicateErrors();
    }

    const user = User.build({ email, password });
    await user.save();

    // Generate JWT
    const userJwt = await jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_KEY!
    );

    // store it in store
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as signUpRouter };
