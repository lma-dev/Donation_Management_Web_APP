import {
  monthlyQuerySchema,
  createMonthlySchema,
  createSupporterSchema,
  createDistributionSchema,
} from "../schema";
import {
  findMonthlyOverview,
  findAllPriorMonths,
  createMonthlyOverview as createMonthlyOverviewData,
  createSupporterDonation as createSupporterDonationData,
  createDistributionRecord as createDistributionRecordData,
} from "../data";
import { MonthlyOverviewError } from "../error";
import type { MonthlyOverviewResponse } from "../types";

function serializeBigInt(value: bigint): string {
  return value.toString();
}

/**
 * Compute carryover for a given month by iterating through all prior months
 * in chronological order. Each month's remaining = carryOver + collected - donated.
 * The carryover for the target month is the remaining balance of the
 * immediately preceding month in the chain.
 */
async function computeCarryOver(year: number, month: number): Promise<bigint> {
  const priorMonths = await findAllPriorMonths(year, month);

  if (priorMonths.length === 0) return BigInt(0);

  let carryOver = BigInt(0);
  for (const m of priorMonths) {
    const collected = m.supporterDonations.reduce(
      (sum, d) => sum + d.kyatAmount,
      BigInt(0),
    );
    const donated = m.distributionRecords.reduce(
      (sum, d) => sum + d.amountMMK,
      BigInt(0),
    );
    const remaining = carryOver + collected - donated;
    carryOver = remaining;
  }

  return carryOver;
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

  const carryOver = await computeCarryOver(parsed.data.year, parsed.data.month);

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
  });

  return {
    id: overview.id,
    year: overview.year,
    month: overview.month,
    exchangeRate: overview.exchangeRate,
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
