import { CustomError } from "./customError";

export class DuplicateErrors extends CustomError {
  statusCode = 409;

  constructor() {
    super("This data already in db!");

    Object.setPrototypeOf(this, DuplicateErrors.prototype);
  }

  serializeErrors() {
    return [{ message: "This data is already in our DB!" }];
  }
}
