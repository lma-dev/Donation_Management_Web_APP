import { prisma } from "@/lib/prisma";

export async function countUsers() {
  return prisma.user.count();
}

export async function findRecentMonthlyOverviews(limit: number) {
  return prisma.monthlyOverview.findMany({
    include: {
      supporterDonations: true,
      distributionRecords: true,
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: limit,
  });
}

export async function findDistributionsByPlace() {
  const records = await prisma.distributionRecord.groupBy({
    by: ["donationPlaceId"],
    _sum: { amountMMK: true },
    orderBy: { _sum: { amountMMK: "desc" } },
    take: 5,
  });

  const placeIds = records
    .map((r) => r.donationPlaceId)
    .filter((id): id is string => id !== null);

  const places = await prisma.donationPlace.findMany({
    where: { id: { in: placeIds } },
    select: { id: true, name: true },
  });

  const placeMap = new Map(places.map((p) => [p.id, p.name]));

  return records.map((r) => ({
    name: r.donationPlaceId ? (placeMap.get(r.donationPlaceId) ?? "Unknown") : "Unknown",
    value: r._sum.amountMMK ?? BigInt(0),
  }));
}
