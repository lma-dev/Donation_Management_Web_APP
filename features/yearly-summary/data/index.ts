import { prisma } from "@/lib/prisma";

export async function findMonthlyOverviewsByYear(year: number) {
  return prisma.monthlyOverview.findMany({
    where: { year },
    include: {
      supporterDonations: true,
      distributionRecords: true,
    },
    orderBy: { month: "asc" },
  });
}

export async function findAllAvailableYears(): Promise<number[]> {
  const results = await prisma.monthlyOverview.findMany({
    select: { year: true },
    distinct: ["year"],
    orderBy: { year: "desc" },
  });
  return results.map((r) => r.year);
}
