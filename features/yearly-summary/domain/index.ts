import { yearlyQuerySchema } from "../schema";
import { findMonthlyOverviewsByYear, findAllAvailableYears } from "../data";
import { YearlySummaryError } from "../error";
import type { YearlySummaryResponse, MonthlyRecordResponse } from "../types";

const MONTH_NAMES: Record<number, string> = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

export async function getYearlySummary(input: {
  year: unknown;
}): Promise<YearlySummaryResponse> {
  const parsed = yearlyQuerySchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new YearlySummaryError(firstError, "VALIDATION_ERROR");
  }

  const overviews = await findMonthlyOverviewsByYear(parsed.data.year);

  if (overviews.length === 0) {
    throw new YearlySummaryError(
      `No data found for fiscal year ${parsed.data.year}`,
      "YEAR_NOT_FOUND",
    );
  }

  let grandTotalCollected = BigInt(0);
  let grandTotalDonated = BigInt(0);

  const monthlyRecords: MonthlyRecordResponse[] = overviews.map((overview) => {
    const monthCollected = overview.supporterDonations.reduce(
      (sum, d) => sum + d.kyatAmount,
      BigInt(0),
    );
    const monthDonated = overview.distributionRecords.reduce(
      (sum, d) => sum + d.amountMMK,
      BigInt(0),
    );

    grandTotalCollected += monthCollected;
    grandTotalDonated += monthDonated;

    return {
      id: overview.id,
      month: MONTH_NAMES[overview.month] ?? `Month ${overview.month}`,
      collectedAmount: monthCollected.toString(),
      donatedAmount: monthDonated.toString(),
    };
  });

  const remainingBalance = grandTotalCollected - grandTotalDonated;

  const createdAt = overviews.reduce(
    (earliest, o) => (o.createdAt < earliest ? o.createdAt : earliest),
    overviews[0].createdAt,
  );
  const updatedAt = overviews.reduce(
    (latest, o) => (o.updatedAt > latest ? o.updatedAt : latest),
    overviews[0].updatedAt,
  );

  return {
    id: `yearly-${parsed.data.year}`,
    fiscalYear: parsed.data.year,
    totalCollected: grandTotalCollected.toString(),
    totalDonated: grandTotalDonated.toString(),
    remainingBalance: remainingBalance.toString(),
    monthlyRecords,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

export async function listAvailableYears(): Promise<number[]> {
  return findAllAvailableYears();
}
