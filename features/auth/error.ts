export class AuthError extends Error {
  constructor(
    message: string,
    public code:
      | "INVALID_CREDENTIALS"
      | "USER_NOT_FOUND"
      | "ACCOUNT_LOCKED"
      | "WRONG_PASSWORD"
      | "VALIDATION_ERROR"
      | "TOKEN_EXPIRED"
      | "TOKEN_INVALID",
  ) {
    super(message);
    this.name = "AuthError";
  }
}
