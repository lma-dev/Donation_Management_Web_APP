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
 * Find the previous month's overview (the month immediately before year/month).
 * For January of year Y, looks up December of year Y-1.
 */
export async function findPreviousMonthOverview(year: number, month: number) {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  return prisma.monthlyOverview.findUnique({
    where: { year_month: { year: prevYear, month: prevMonth } },
    include: {
      supporterDonations: true,
      distributionRecords: true,
    },
  });
}

export async function createMonthlyOverview(data: {
  year: number;
  month: number;
  exchangeRate: number;
  carryOver: bigint;
}) {
  return prisma.monthlyOverview.create({
    data: {
      year: data.year,
      month: data.month,
      exchangeRate: data.exchangeRate,
      carryOver: data.carryOver,
    },
    include: {
      supporterDonations: true,
      distributionRecords: true,
    },
  });
}

export async function updateExchangeRate(id: string, exchangeRate: number) {
  return prisma.$transaction(async (tx) => {
    const overview = await tx.monthlyOverview.update({
      where: { id },
      data: { exchangeRate },
      include: {
        supporterDonations: true,
      },
    });

    const jpyDonations = overview.supporterDonations.filter(
      (d) => d.currency === "JPY",
    );

    for (const donation of jpyDonations) {
      const newKyatAmount = BigInt(
        Math.round(Number(donation.amount) * exchangeRate),
      );
      await tx.supporterDonation.update({
        where: { id: donation.id },
        data: { kyatAmount: newKyatAmount },
      });
    }

    return tx.monthlyOverview.findUnique({
      where: { id },
      include: {
        supporterDonations: { orderBy: { createdAt: "asc" } },
        distributionRecords: { orderBy: { createdAt: "asc" } },
      },
    });
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
