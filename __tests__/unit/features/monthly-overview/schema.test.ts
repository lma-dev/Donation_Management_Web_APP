import { describe, it, expect } from "vitest";
import {
  monthlyQuerySchema,
  createMonthlySchema,
  createSupporterSchema,
  createDistributionSchema,
  updateExchangeRateSchema,
  monthlyExportSchema,
  updateSupporterSchema,
  updateDistributionSchema,
} from "@/features/monthly-overview/schema";

describe("monthlyQuerySchema", () => {
  it("accepts valid year and month", () => {
    const result = monthlyQuerySchema.safeParse({ year: 2025, month: 6 });
    expect(result.success).toBe(true);
  });

  it("coerces string values to numbers", () => {
    const result = monthlyQuerySchema.safeParse({ year: "2025", month: "6" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.year).toBe(2025);
      expect(result.data.month).toBe(6);
    }
  });

  it("rejects year below 2000", () => {
    expect(
      monthlyQuerySchema.safeParse({ year: 1999, month: 1 }).success,
    ).toBe(false);
  });

  it("rejects year above 2100", () => {
    expect(
      monthlyQuerySchema.safeParse({ year: 2101, month: 1 }).success,
    ).toBe(false);
  });

  it("accepts boundary months (1 and 12)", () => {
    expect(
      monthlyQuerySchema.safeParse({ year: 2025, month: 1 }).success,
    ).toBe(true);
    expect(
      monthlyQuerySchema.safeParse({ year: 2025, month: 12 }).success,
    ).toBe(true);
  });

  it("rejects month 0 and month 13", () => {
    expect(
      monthlyQuerySchema.safeParse({ year: 2025, month: 0 }).success,
    ).toBe(false);
    expect(
      monthlyQuerySchema.safeParse({ year: 2025, month: 13 }).success,
    ).toBe(false);
  });

  it("rejects non-integer month", () => {
    expect(
      monthlyQuerySchema.safeParse({ year: 2025, month: 1.5 }).success,
    ).toBe(false);
  });
});

describe("createMonthlySchema", () => {
  const valid = {
    year: 2025,
    month: 6,
    exchangeRate: 30.5,
    carryOver: 100000,
  };

  it("accepts valid input", () => {
    expect(createMonthlySchema.safeParse(valid).success).toBe(true);
  });

  it("rejects negative carry over", () => {
    expect(
      createMonthlySchema.safeParse({ ...valid, carryOver: -1 }).success,
    ).toBe(false);
  });

  it("accepts zero carry over", () => {
    expect(
      createMonthlySchema.safeParse({ ...valid, carryOver: 0 }).success,
    ).toBe(true);
  });

  it("rejects zero exchange rate", () => {
    expect(
      createMonthlySchema.safeParse({ ...valid, exchangeRate: 0 }).success,
    ).toBe(false);
  });

  it("rejects negative exchange rate", () => {
    expect(
      createMonthlySchema.safeParse({ ...valid, exchangeRate: -5 }).success,
    ).toBe(false);
  });
});

describe("createSupporterSchema", () => {
  const valid = {
    monthlyOverviewId: "abc123",
    name: "Taro",
    amount: 10000,
    currency: "JPY" as const,
    kyatAmount: 305000,
  };

  it("accepts valid JPY donation", () => {
    expect(createSupporterSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts valid MMK donation", () => {
    expect(
      createSupporterSchema.safeParse({ ...valid, currency: "MMK" }).success,
    ).toBe(true);
  });

  it("rejects invalid currency", () => {
    expect(
      createSupporterSchema.safeParse({ ...valid, currency: "USD" }).success,
    ).toBe(false);
  });

  it("rejects empty name", () => {
    expect(
      createSupporterSchema.safeParse({ ...valid, name: "" }).success,
    ).toBe(false);
  });

  it("rejects negative amount", () => {
    expect(
      createSupporterSchema.safeParse({ ...valid, amount: -1 }).success,
    ).toBe(false);
  });

  it("rejects empty monthlyOverviewId", () => {
    expect(
      createSupporterSchema.safeParse({ ...valid, monthlyOverviewId: "" })
        .success,
    ).toBe(false);
  });
});

describe("createDistributionSchema", () => {
  const valid = {
    monthlyOverviewId: "abc123",
    donationPlaceId: "place1",
    recipient: "Temple A",
    amountMMK: 50000,
  };

  it("accepts valid distribution without remarks", () => {
    expect(createDistributionSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts valid distribution with remarks", () => {
    expect(
      createDistributionSchema.safeParse({ ...valid, remarks: "Monthly" })
        .success,
    ).toBe(true);
  });

  it("rejects empty recipient", () => {
    expect(
      createDistributionSchema.safeParse({ ...valid, recipient: "" }).success,
    ).toBe(false);
  });

  it("rejects empty donationPlaceId", () => {
    expect(
      createDistributionSchema.safeParse({ ...valid, donationPlaceId: "" })
        .success,
    ).toBe(false);
  });

  it("rejects negative amount", () => {
    expect(
      createDistributionSchema.safeParse({ ...valid, amountMMK: -100 }).success,
    ).toBe(false);
  });
});

describe("updateExchangeRateSchema", () => {
  it("accepts valid update", () => {
    expect(
      updateExchangeRateSchema.safeParse({ id: "abc", exchangeRate: 30.5 })
        .success,
    ).toBe(true);
  });

  it("rejects zero exchange rate", () => {
    expect(
      updateExchangeRateSchema.safeParse({ id: "abc", exchangeRate: 0 })
        .success,
    ).toBe(false);
  });

  it("rejects empty id", () => {
    expect(
      updateExchangeRateSchema.safeParse({ id: "", exchangeRate: 30.5 })
        .success,
    ).toBe(false);
  });
});

describe("monthlyExportSchema", () => {
  it("accepts excel export", () => {
    expect(
      monthlyExportSchema.safeParse({ year: 2025, month: 6, type: "excel" })
        .success,
    ).toBe(true);
  });

  it("accepts pdf export", () => {
    expect(
      monthlyExportSchema.safeParse({ year: 2025, month: 6, type: "pdf" })
        .success,
    ).toBe(true);
  });

  it("accepts json export", () => {
    expect(
      monthlyExportSchema.safeParse({ year: 2025, month: 6, type: "json" })
        .success,
    ).toBe(true);
  });

  it("rejects invalid export type", () => {
    expect(
      monthlyExportSchema.safeParse({ year: 2025, month: 6, type: "csv" })
        .success,
    ).toBe(false);
  });
});

describe("updateSupporterSchema", () => {
  const valid = {
    id: "supporter1",
    name: "Taro",
    amount: 10000,
    currency: "JPY" as const,
    kyatAmount: 305000,
  };

  it("accepts valid update", () => {
    expect(updateSupporterSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty id", () => {
    expect(
      updateSupporterSchema.safeParse({ ...valid, id: "" }).success,
    ).toBe(false);
  });
});

describe("updateDistributionSchema", () => {
  const valid = {
    id: "dist1",
    donationPlaceId: "place1",
    recipient: "Temple A",
    amountMMK: 50000,
  };

  it("accepts valid update", () => {
    expect(updateDistributionSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts update with optional remarks", () => {
    expect(
      updateDistributionSchema.safeParse({ ...valid, remarks: "Note" }).success,
    ).toBe(true);
  });

  it("rejects empty id", () => {
    expect(
      updateDistributionSchema.safeParse({ ...valid, id: "" }).success,
    ).toBe(false);
  });
});
