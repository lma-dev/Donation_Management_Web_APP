export class DonationPlaceError extends Error {
  constructor(
    message: string,
    public code:
      | "VALIDATION_ERROR"
      | "NOT_FOUND"
      | "DUPLICATE_NAME",
  ) {
    super(message);
    this.name = "DonationPlaceError";
  }
}
