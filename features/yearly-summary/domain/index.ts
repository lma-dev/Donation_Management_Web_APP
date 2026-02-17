import { yearlyQuerySchema } from "../schema";
import { findYearlySummaryByYear, findAllFiscalYears } from "../data";
import { YearlySummaryError } from "../error";
import type { YearlySummaryResponse } from "../types";

const MONTH_ORDER = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function getYearlySummary(input: {
  year: unknown;
}): Promise<YearlySummaryResponse> {
  const parsed = yearlyQuerySchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new YearlySummaryError(firstError, "VALIDATION_ERROR");
  }

  const summary = await findYearlySummaryByYear(parsed.data.year);
  if (!summary) {
    throw new YearlySummaryError(
      `No data found for fiscal year ${parsed.data.year}`,
      "YEAR_NOT_FOUND",
    );
  }

  const sortedRecords = [...summary.monthlyRecords].sort(
    (a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month),
  );

  const totalCollected = Number(summary.totalCollected);
  const totalDonated = Number(summary.totalDonated);
  const remainingBalance = totalCollected - totalDonated;

  return {
    id: summary.id,
    fiscalYear: summary.fiscalYear,
    totalCollected: totalCollected.toString(),
    totalDonated: totalDonated.toString(),
    remainingBalance: remainingBalance.toString(),
    monthlyRecords: sortedRecords.map((r) => ({
      id: r.id,
      month: r.month,
      collectedAmount: Number(r.collectedAmount).toString(),
      donatedAmount: Number(r.donatedAmount).toString(),
    })),
    createdAt: summary.createdAt.toISOString(),
    updatedAt: summary.updatedAt.toISOString(),
  };
}

export async function listAvailableYears(): Promise<number[]> {
  const years = await findAllFiscalYears();
  return years.map((y) => y.fiscalYear);
}
