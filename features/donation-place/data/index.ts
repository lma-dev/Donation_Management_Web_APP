import { prisma } from "@/lib/prisma";

export async function findAllDonationPlaces() {
  return prisma.donationPlace.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function findActiveDonationPlaces() {
  return prisma.donationPlace.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { name: "asc" },
  });
}

export async function findDonationPlaceById(id: string) {
  return prisma.donationPlace.findFirst({
    where: { id, deletedAt: null },
  });
}

export async function findDonationPlaceByName(name: string) {
  return prisma.donationPlace.findFirst({
    where: { name, deletedAt: null },
  });
}

export async function createDonationPlace(data: {
  name: string;
  note?: string;
  isActive?: boolean;
}) {
  return prisma.donationPlace.create({ data });
}

export async function updateDonationPlace(
  id: string,
  data: { name?: string; note?: string; isActive?: boolean },
) {
  return prisma.donationPlace.update({
    where: { id },
    data,
  });
}

export async function softDeleteDonationPlace(id: string) {
  return prisma.donationPlace.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function findDeletedDonationPlaces() {
  return prisma.donationPlace.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
  });
}

export async function restoreDonationPlace(id: string) {
  return prisma.donationPlace.update({
    where: { id },
    data: { deletedAt: null },
  });
}

export async function hardDeleteDonationPlace(id: string) {
  return prisma.donationPlace.delete({
    where: { id },
  });
}
