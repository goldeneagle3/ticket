import { CustomError } from "./customError";

export class DBConnectionError extends CustomError {
  statusCode = 500;
  reason = "Encounter an error when connecting db!";

  constructor() {
    super("DB Error");

    // Only because we are extending a built-in class
    Object.setPrototypeOf(this, DBConnectionError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
