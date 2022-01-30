import { CustomError } from "./customError";

export class AuthorizationError extends CustomError {
  message = "401 Authorization Error";
  statusCode = 401;

  constructor() {
    super("Authorization Error");

    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
