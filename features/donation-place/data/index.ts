import { prisma } from "@/lib/prisma";

export async function findAllDonationPlaces() {
  return prisma.donationPlace.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function findActiveDonationPlaces() {
  return prisma.donationPlace.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function findDonationPlaceById(id: string) {
  return prisma.donationPlace.findUnique({
    where: { id },
  });
}

export async function findDonationPlaceByName(name: string) {
  return prisma.donationPlace.findUnique({
    where: { name },
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

export async function deleteDonationPlace(id: string) {
  return prisma.donationPlace.delete({
    where: { id },
  });
}
