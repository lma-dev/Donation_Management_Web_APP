import type { YearlySummaryResponse } from "../types";

export function generateJsonExport(data: YearlySummaryResponse): string {
  return JSON.stringify(
    {
      fiscalYear: data.fiscalYear,
      generatedAt: new Date().toISOString(),
      summary: {
        totalCollected: data.totalCollected,
        totalDonated: data.totalDonated,
        remainingBalance: data.remainingBalance,
      },
      monthlyBreakdown: data.monthlyRecords.map((r) => ({
        month: r.month,
        collectedAmount: r.collectedAmount,
        donatedAmount: r.donatedAmount,
      })),
    },
    null,
    2,
  );
}
