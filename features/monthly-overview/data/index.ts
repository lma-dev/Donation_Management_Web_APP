import { prisma } from "@/lib/prisma";

export async function findMonthlyOverview(year: number, month: number) {
  return prisma.monthlyOverview.findUnique({
    where: { year_month: { year, month } },
    include: {
      supporterDonations: { orderBy: { createdAt: "asc" } },
      distributionRecords: { orderBy: { createdAt: "asc" } },
    },
  });
}

/**
 * Fetch all monthly overviews that exist strictly before the given year/month,
 * ordered chronologically. Used for iterative carryover computation.
 */
export async function findAllPriorMonths(year: number, month: number) {
  return prisma.monthlyOverview.findMany({
    where: {
      OR: [
        { year: { lt: year } },
        { year, month: { lt: month } },
      ],
    },
    include: {
      supporterDonations: true,
      distributionRecords: true,
    },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });
}

export async function createMonthlyOverview(data: {
  year: number;
  month: number;
  exchangeRate: number;
}) {
  return prisma.monthlyOverview.create({
    data: {
      year: data.year,
      month: data.month,
      exchangeRate: data.exchangeRate,
    },
    include: {
      supporterDonations: true,
      distributionRecords: true,
    },
  });
}

export async function createSupporterDonation(data: {
  monthlyOverviewId: string;
  name: string;
  amount: bigint;
  currency: string;
  kyatAmount: bigint;
}) {
  return prisma.supporterDonation.create({
    data: {
      monthlyOverviewId: data.monthlyOverviewId,
      name: data.name,
      amount: data.amount,
      currency: data.currency,
      kyatAmount: data.kyatAmount,
    },
  });
}

export async function createDistributionRecord(data: {
  monthlyOverviewId: string;
  donationPlaceId?: string;
  recipient: string;
  amountMMK: bigint;
  remarks?: string;
}) {
  return prisma.distributionRecord.create({
    data: {
      monthlyOverviewId: data.monthlyOverviewId,
      donationPlaceId: data.donationPlaceId,
      recipient: data.recipient,
      amountMMK: data.amountMMK,
      remarks: data.remarks,
    },
  });
}
