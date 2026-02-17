import { prisma } from "@/lib/prisma";

export async function findYearlySummaryByYear(fiscalYear: number) {
  return prisma.yearlySummary.findUnique({
    where: { fiscalYear },
    include: {
      monthlyRecords: true,
    },
  });
}

export async function findAllFiscalYears() {
  return prisma.yearlySummary.findMany({
    select: { fiscalYear: true },
    orderBy: { fiscalYear: "desc" },
  });
}
