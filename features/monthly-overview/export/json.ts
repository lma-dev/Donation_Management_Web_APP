import type { MonthlyOverviewResponse } from "../types";

export function generateMonthlyJsonExport(data: MonthlyOverviewResponse): string {
  return JSON.stringify(
    {
      month: data.month,
      year: data.year,
      generatedAt: new Date().toISOString(),
      exchangeRate: data.exchangeRate,
      summary: {
        carryOver: data.carryOver,
        totalCollected: data.totalCollected,
        totalDonated: data.totalDonated,
        remainingBalance: data.remainingBalance,
      },
      supporters: data.supporters.map((s) => ({
        name: s.name,
        amount: s.amount,
        currency: s.currency,
        kyatAmount: s.kyatAmount,
      })),
      distributions: data.distributions.map((d) => ({
        recipient: d.recipient,
        amountMMK: d.amountMMK,
        remarks: d.remarks,
      })),
    },
    null,
    2,
  );
}
