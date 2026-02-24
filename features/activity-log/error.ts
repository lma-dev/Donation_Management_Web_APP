export class ActivityLogError extends Error {
  constructor(
    message: string,
    public code: "VALIDATION_ERROR" | "NOT_FOUND",
  ) {
    super(message);
    this.name = "ActivityLogError";
  }
}
