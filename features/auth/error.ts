export class AuthError extends Error {
  constructor(
    message: string,
    public code:
      | "INVALID_CREDENTIALS"
      | "USER_NOT_FOUND"
      | "ACCOUNT_LOCKED"
      | "WRONG_PASSWORD"
      | "VALIDATION_ERROR",
  ) {
    super(message);
    this.name = "AuthError";
  }
}
