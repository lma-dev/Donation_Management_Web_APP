export const MONTH_KEYS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

/**
 * Get the translation key for a 1-based month number (1 = January, 12 = December).
 */
export function getMonthKey(month: number): string {
  return MONTH_KEYS[month - 1] ?? "";
}
