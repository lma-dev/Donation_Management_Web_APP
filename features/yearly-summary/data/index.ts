import { prisma } from "@/lib/prisma";

export async function findMonthlyOverviewsByYear(year: number) {
  return prisma.monthlyOverview.findMany({
    where: { year, deletedAt: null },
    include: {
      supporterDonations: { where: { deletedAt: null } },
      distributionRecords: { where: { deletedAt: null } },
    },
    orderBy: { month: "asc" },
  });
}

export async function findAllAvailableYears(): Promise<number[]> {
  const results = await prisma.monthlyOverview.findMany({
    where: { deletedAt: null },
    select: { year: true },
    distinct: ["year"],
    orderBy: { year: "desc" },
  });
  return results.map((r) => r.year);
}
