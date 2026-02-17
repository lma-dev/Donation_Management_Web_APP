export class UserError extends Error {
  constructor(
    message: string,
    public code:
      | "VALIDATION_ERROR"
      | "EMAIL_ALREADY_EXISTS"
      | "USER_NOT_FOUND"
      | "DELETE_SELF",
  ) {
    super(message);
    this.name = "UserError";
  }
}
