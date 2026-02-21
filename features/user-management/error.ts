export class UserError extends Error {
  constructor(
    message: string,
    public code:
      | "VALIDATION_ERROR"
      | "EMAIL_ALREADY_EXISTS"
      | "USER_NOT_FOUND"
      | "DELETE_SELF"
      | "ALREADY_LOCKED"
      | "NOT_LOCKED",
  ) {
    super(message);
    this.name = "UserError";
  }
}
