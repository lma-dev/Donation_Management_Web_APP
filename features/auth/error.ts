export class AuthError extends Error {
  constructor(
    message: string,
    public code: "INVALID_CREDENTIALS" | "USER_NOT_FOUND",
  ) {
    super(message);
    this.name = "AuthError";
  }
}
