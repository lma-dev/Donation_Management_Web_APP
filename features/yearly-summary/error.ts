export class YearlySummaryError extends Error {
  constructor(
    message: string,
    public code:
      | "VALIDATION_ERROR"
      | "YEAR_NOT_FOUND"
      | "INVALID_EXPORT_TYPE"
      | "EXPORT_GENERATION_FAILED",
  ) {
    super(message);
    this.name = "YearlySummaryError";
  }
}
