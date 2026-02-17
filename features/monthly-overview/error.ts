export class MonthlyOverviewError extends Error {
  constructor(
    message: string,
    public code:
      | "VALIDATION_ERROR"
      | "MONTH_NOT_FOUND"
      | "DUPLICATE_MONTH"
      | "OVERVIEW_NOT_FOUND"
      | "INVALID_EXPORT_TYPE"
      | "EXPORT_GENERATION_FAILED",
  ) {
    super(message);
    this.name = "MonthlyOverviewError";
  }
}
