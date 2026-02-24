import { createDonationPlaceSchema, updateDonationPlaceSchema } from "../schema";
import {
  findAllDonationPlaces,
  findDeletedDonationPlaces,
  findActiveDonationPlaces,
  findDonationPlaceById,
  findDonationPlaceByName,
  createDonationPlace as createInDb,
  updateDonationPlace as updateInDb,
  softDeleteDonationPlace as softDeleteInDb,
  hardDeleteDonationPlace as hardDeleteInDb,
  restoreDonationPlace as restoreInDb,
} from "../data";
import { DonationPlaceError } from "../error";

export async function listDonationPlaces() {
  return findAllDonationPlaces();
}

export async function listActiveDonationPlaces() {
  return findActiveDonationPlaces();
}

export async function createDonationPlace(input: unknown) {
  const parsed = createDonationPlaceSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new DonationPlaceError(firstError, "VALIDATION_ERROR");
  }

  const existing = await findDonationPlaceByName(parsed.data.name);
  if (existing) {
    throw new DonationPlaceError(
      "A donation place with this name already exists",
      "DUPLICATE_NAME",
    );
  }

  return createInDb(parsed.data);
}

export async function editDonationPlace(id: string, input: unknown) {
  const parsed = updateDonationPlaceSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new DonationPlaceError(firstError, "VALIDATION_ERROR");
  }

  const place = await findDonationPlaceById(id);
  if (!place) {
    throw new DonationPlaceError("Donation place not found", "NOT_FOUND");
  }

  if (parsed.data.name && parsed.data.name !== place.name) {
    const existing = await findDonationPlaceByName(parsed.data.name);
    if (existing) {
      throw new DonationPlaceError(
        "A donation place with this name already exists",
        "DUPLICATE_NAME",
      );
    }
  }

  return updateInDb(id, parsed.data);
}

export async function removeDonationPlace(id: string) {
  const place = await findDonationPlaceById(id);
  if (!place) {
    throw new DonationPlaceError("Donation place not found", "NOT_FOUND");
  }

  await softDeleteInDb(id);
}

export async function listDeletedDonationPlaces() {
  return findDeletedDonationPlaces();
}

export async function restoreDonationPlace(id: string) {
  await restoreInDb(id);
}

export async function purgeDonationPlace(id: string) {
  const place = await findDonationPlaceById(id);
  if (!place) {
    throw new DonationPlaceError("Donation place not found", "NOT_FOUND");
  }

  await hardDeleteInDb(id);
}
