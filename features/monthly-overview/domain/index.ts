import {
  monthlyQuerySchema,
  createMonthlySchema,
  createSupporterSchema,
  createDistributionSchema,
  updateExchangeRateSchema,
  updateSupporterSchema,
  updateDistributionSchema,
} from "../schema";
import {
  findMonthlyOverview,
  findPreviousMonthOverview,
  createMonthlyOverview as createMonthlyOverviewData,
  createSupporterDonation as createSupporterDonationData,
  createDistributionRecord as createDistributionRecordData,
  updateExchangeRate as updateExchangeRateData,
  updateSupporterDonation as updateSupporterDonationData,
  softDeleteSupporterDonation as softDeleteSupporterDonationData,
  hardDeleteSupporterDonation as hardDeleteSupporterDonationData,
  findDeletedSupporterDonations,
  restoreSupporterDonation as restoreSupporterDonationData,
  updateDistributionRecord as updateDistributionRecordData,
  softDeleteDistributionRecord as softDeleteDistributionRecordData,
  hardDeleteDistributionRecord as hardDeleteDistributionRecordData,
  findDeletedDistributionRecords,
  restoreDistributionRecord as restoreDistributionRecordData,
} from "../data";
import { MonthlyOverviewError } from "../error";
import type { MonthlyOverviewResponse } from "../types";

function serializeBigInt(value: bigint): string {
  return value.toString();
}

export async function getMonthlyOverview(input: {
  year: unknown;
  month: unknown;
}): Promise<MonthlyOverviewResponse> {
  const parsed = monthlyQuerySchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new MonthlyOverviewError(firstError, "VALIDATION_ERROR");
  }

  const overview = await findMonthlyOverview(parsed.data.year, parsed.data.month);
  if (!overview) {
    throw new MonthlyOverviewError(
      `No data found for ${parsed.data.year}-${String(parsed.data.month).padStart(2, "0")}`,
      "MONTH_NOT_FOUND",
    );
  }

  const carryOver = overview.carryOver;

  const totalCollected = overview.supporterDonations.reduce(
    (sum, d) => sum + d.kyatAmount,
    BigInt(0),
  );

  const totalDonated = overview.distributionRecords.reduce(
    (sum, d) => sum + d.amountMMK,
    BigInt(0),
  );

  const remainingBalance = carryOver + totalCollected - totalDonated;

  return {
    id: overview.id,
    year: overview.year,
    month: overview.month,
    exchangeRate: overview.exchangeRate,
    carryOver: serializeBigInt(carryOver),
    totalCollected: serializeBigInt(totalCollected),
    totalDonated: serializeBigInt(totalDonated),
    remainingBalance: serializeBigInt(remainingBalance),
    supporters: overview.supporterDonations.map((s) => ({
      id: s.id,
      name: s.name,
      amount: serializeBigInt(s.amount),
      currency: s.currency,
      kyatAmount: serializeBigInt(s.kyatAmount),
      createdAt: s.createdAt.toISOString(),
    })),
    distributions: overview.distributionRecords.map((d) => ({
      id: d.id,
      donationPlaceId: d.donationPlaceId,
      recipient: d.recipient,
      amountMMK: serializeBigInt(d.amountMMK),
      remarks: d.remarks,
      createdAt: d.createdAt.toISOString(),
    })),
    createdAt: overview.createdAt.toISOString(),
    updatedAt: overview.updatedAt.toISOString(),
  };
}

/**
 * Get the previous month's remaining balance for display when creating a new month.
 * Returns "0" if no previous month exists.
 */
export async function getPreviousMonthBalance(input: {
  year: unknown;
  month: unknown;
}): Promise<string> {
  const parsed = monthlyQuerySchema.safeParse(input);
  if (!parsed.success) {
    return "0";
  }

  const prev = await findPreviousMonthOverview(parsed.data.year, parsed.data.month);
  if (!prev) return "0";

  const carryOver = prev.carryOver;
  const collected = prev.supporterDonations.reduce(
    (sum, d) => sum + d.kyatAmount,
    BigInt(0),
  );
  const donated = prev.distributionRecords.reduce(
    (sum, d) => sum + d.amountMMK,
    BigInt(0),
  );

  const remaining = carryOver + collected - donated;
  return remaining.toString();
}

export async function createMonthlyOverview(input: unknown) {
  const parsed = createMonthlySchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new MonthlyOverviewError(firstError, "VALIDATION_ERROR");
  }

  const existing = await findMonthlyOverview(parsed.data.year, parsed.data.month);
  if (existing) {
    throw new MonthlyOverviewError(
      `Monthly overview for ${parsed.data.year}-${String(parsed.data.month).padStart(2, "0")} already exists`,
      "DUPLICATE_MONTH",
    );
  }

  const overview = await createMonthlyOverviewData({
    year: parsed.data.year,
    month: parsed.data.month,
    exchangeRate: parsed.data.exchangeRate,
    carryOver: BigInt(parsed.data.carryOver),
  });

  return {
    id: overview.id,
    year: overview.year,
    month: overview.month,
    exchangeRate: overview.exchangeRate,
  };
}

export async function updateMonthlyExchangeRate(input: unknown): Promise<MonthlyOverviewResponse> {
  const parsed = updateExchangeRateSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new MonthlyOverviewError(firstError, "VALIDATION_ERROR");
  }

  const overview = await updateExchangeRateData(
    parsed.data.id,
    parsed.data.exchangeRate,
  );

  if (!overview) {
    throw new MonthlyOverviewError(
      "Monthly overview not found",
      "OVERVIEW_NOT_FOUND",
    );
  }

  const carryOver = overview.carryOver;

  const totalCollected = overview.supporterDonations.reduce(
    (sum, d) => sum + d.kyatAmount,
    BigInt(0),
  );

  const totalDonated = overview.distributionRecords.reduce(
    (sum, d) => sum + d.amountMMK,
    BigInt(0),
  );

  const remainingBalance = carryOver + totalCollected - totalDonated;

  return {
    id: overview.id,
    year: overview.year,
    month: overview.month,
    exchangeRate: overview.exchangeRate,
    carryOver: serializeBigInt(carryOver),
    totalCollected: serializeBigInt(totalCollected),
    totalDonated: serializeBigInt(totalDonated),
    remainingBalance: serializeBigInt(remainingBalance),
    supporters: overview.supporterDonations.map((s) => ({
      id: s.id,
      name: s.name,
      amount: serializeBigInt(s.amount),
      currency: s.currency,
      kyatAmount: serializeBigInt(s.kyatAmount),
      createdAt: s.createdAt.toISOString(),
    })),
    distributions: overview.distributionRecords.map((d) => ({
      id: d.id,
      donationPlaceId: d.donationPlaceId,
      recipient: d.recipient,
      amountMMK: serializeBigInt(d.amountMMK),
      remarks: d.remarks,
      createdAt: d.createdAt.toISOString(),
    })),
    createdAt: overview.createdAt.toISOString(),
    updatedAt: overview.updatedAt.toISOString(),
  };
}

export async function addSupporterDonation(input: unknown) {
  const parsed = createSupporterSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new MonthlyOverviewError(firstError, "VALIDATION_ERROR");
  }

  const donation = await createSupporterDonationData({
    monthlyOverviewId: parsed.data.monthlyOverviewId,
    name: parsed.data.name,
    amount: BigInt(parsed.data.amount),
    currency: parsed.data.currency,
    kyatAmount: BigInt(parsed.data.kyatAmount),
  });

  return {
    id: donation.id,
    name: donation.name,
    amount: serializeBigInt(donation.amount),
    currency: donation.currency,
    kyatAmount: serializeBigInt(donation.kyatAmount),
    createdAt: donation.createdAt.toISOString(),
  };
}

export async function addDistributionRecord(input: unknown) {
  const parsed = createDistributionSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new MonthlyOverviewError(firstError, "VALIDATION_ERROR");
  }

  const record = await createDistributionRecordData({
    monthlyOverviewId: parsed.data.monthlyOverviewId,
    donationPlaceId: parsed.data.donationPlaceId,
    recipient: parsed.data.recipient,
    amountMMK: BigInt(parsed.data.amountMMK),
    remarks: parsed.data.remarks,
  });

  return {
    id: record.id,
    donationPlaceId: record.donationPlaceId,
    recipient: record.recipient,
    amountMMK: serializeBigInt(record.amountMMK),
    remarks: record.remarks,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function updateSupporterDonation(input: unknown) {
  const parsed = updateSupporterSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new MonthlyOverviewError(firstError, "VALIDATION_ERROR");
  }

  try {
    const donation = await updateSupporterDonationData(parsed.data.id, {
      name: parsed.data.name,
      amount: BigInt(parsed.data.amount),
      currency: parsed.data.currency,
      kyatAmount: BigInt(parsed.data.kyatAmount),
    });

    return {
      id: donation.id,
      name: donation.name,
      amount: serializeBigInt(donation.amount),
      currency: donation.currency,
      kyatAmount: serializeBigInt(donation.kyatAmount),
      createdAt: donation.createdAt.toISOString(),
    };
  } catch {
    throw new MonthlyOverviewError(
      "Supporter donation not found",
      "RECORD_NOT_FOUND",
    );
  }
}

export async function removeSupporterDonation(id: string) {
  if (!id) {
    throw new MonthlyOverviewError("ID is required", "VALIDATION_ERROR");
  }

  try {
    await softDeleteSupporterDonationData(id);
  } catch {
    throw new MonthlyOverviewError(
      "Supporter donation not found",
      "RECORD_NOT_FOUND",
    );
  }
}

export async function purgeSupporterDonation(id: string) {
  if (!id) {
    throw new MonthlyOverviewError("ID is required", "VALIDATION_ERROR");
  }

  try {
    await hardDeleteSupporterDonationData(id);
  } catch {
    throw new MonthlyOverviewError(
      "Supporter donation not found",
      "RECORD_NOT_FOUND",
    );
  }
}

export async function updateDistributionRecord(input: unknown) {
  const parsed = updateDistributionSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new MonthlyOverviewError(firstError, "VALIDATION_ERROR");
  }

  try {
    const record = await updateDistributionRecordData(parsed.data.id, {
      donationPlaceId: parsed.data.donationPlaceId,
      recipient: parsed.data.recipient,
      amountMMK: BigInt(parsed.data.amountMMK),
      remarks: parsed.data.remarks,
    });

    return {
      id: record.id,
      donationPlaceId: record.donationPlaceId,
      recipient: record.recipient,
      amountMMK: serializeBigInt(record.amountMMK),
      remarks: record.remarks,
      createdAt: record.createdAt.toISOString(),
    };
  } catch {
    throw new MonthlyOverviewError(
      "Distribution record not found",
      "RECORD_NOT_FOUND",
    );
  }
}

export async function removeDistributionRecord(id: string) {
  if (!id) {
    throw new MonthlyOverviewError("ID is required", "VALIDATION_ERROR");
  }

  try {
    await softDeleteDistributionRecordData(id);
  } catch {
    throw new MonthlyOverviewError(
      "Distribution record not found",
      "RECORD_NOT_FOUND",
    );
  }
}

export async function listDeletedSupporterDonations() {
  const donations = await findDeletedSupporterDonations();
  return donations.map((d) => ({
    id: d.id,
    name: d.name,
    amount: serializeBigInt(d.amount),
    currency: d.currency,
    kyatAmount: serializeBigInt(d.kyatAmount),
    deletedAt: d.deletedAt!.toISOString(),
    createdAt: d.createdAt.toISOString(),
    monthlyOverview: d.monthlyOverview,
  }));
}

export async function restoreSupporterDonation(id: string) {
  if (!id) {
    throw new MonthlyOverviewError("ID is required", "VALIDATION_ERROR");
  }
  await restoreSupporterDonationData(id);
}

export async function listDeletedDistributionRecords() {
  const records = await findDeletedDistributionRecords();
  return records.map((d) => ({
    id: d.id,
    recipient: d.recipient,
    amountMMK: serializeBigInt(d.amountMMK),
    remarks: d.remarks,
    deletedAt: d.deletedAt!.toISOString(),
    createdAt: d.createdAt.toISOString(),
    monthlyOverview: d.monthlyOverview,
    donationPlace: d.donationPlace,
  }));
}

export async function restoreDistributionRecord(id: string) {
  if (!id) {
    throw new MonthlyOverviewError("ID is required", "VALIDATION_ERROR");
  }
  await restoreDistributionRecordData(id);
}

export async function purgeDistributionRecord(id: string) {
  if (!id) {
    throw new MonthlyOverviewError("ID is required", "VALIDATION_ERROR");
  }

  try {
    await hardDeleteDistributionRecordData(id);
  } catch {
    throw new MonthlyOverviewError(
      "Distribution record not found",
      "RECORD_NOT_FOUND",
    );
  }
}
