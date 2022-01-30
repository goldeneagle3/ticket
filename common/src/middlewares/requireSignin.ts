import { Request, Response, NextFunction } from "express";
import { AuthorizationError } from "../errors/authorizationError";

export const requireSignin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser) {
    throw new AuthorizationError();
  }
  next()
};
