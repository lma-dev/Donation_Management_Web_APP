import {
  countUsers,
  findRecentMonthlyOverviews,
  findDistributionsByPlace,
} from "../data";
import type { DashboardResponse, MonthlyChartItem } from "../types";

const MONTH_SHORT: Record<number, string> = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

export async function getDashboardData(): Promise<DashboardResponse> {
  const [totalUsers, overviews, distributionsByPlace] = await Promise.all([
    countUsers(),
    findRecentMonthlyOverviews(6),
    findDistributionsByPlace(),
  ]);

  const monthlyChart: MonthlyChartItem[] = overviews
    .sort((a, b) => a.year - b.year || a.month - b.month)
    .map((overview) => {
      const collected = overview.supporterDonations.reduce(
        (sum, d) => sum + d.kyatAmount,
        BigInt(0),
      );
      const donated = overview.distributionRecords.reduce(
        (sum, d) => sum + d.amountMMK,
        BigInt(0),
      );

      return {
        month: `${MONTH_SHORT[overview.month] ?? overview.month} ${overview.year}`,
        collected: Number(collected),
        donated: Number(donated),
      };
    });

  const distributionByPlace = distributionsByPlace.map((d) => ({
    name: d.name,
    value: Number(d.value),
  }));

  return {
    totalUsers,
    monthlyChart,
    distributionByPlace,
  };
}
