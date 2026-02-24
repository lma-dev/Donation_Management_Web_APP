import { describe, it, expect, vi, beforeEach } from "vitest";
import { MonthlyOverviewError } from "@/features/monthly-overview/error";

// Mock the data layer
vi.mock("@/features/monthly-overview/data", () => ({
  findMonthlyOverview: vi.fn(),
  findPreviousMonthOverview: vi.fn(),
  createMonthlyOverview: vi.fn(),
  createSupporterDonation: vi.fn(),
  createDistributionRecord: vi.fn(),
  updateExchangeRate: vi.fn(),
  updateSupporterDonation: vi.fn(),
  softDeleteSupporterDonation: vi.fn(),
  hardDeleteSupporterDonation: vi.fn(),
  updateDistributionRecord: vi.fn(),
  softDeleteDistributionRecord: vi.fn(),
  hardDeleteDistributionRecord: vi.fn(),
}));

import {
  getMonthlyOverview,
  getPreviousMonthBalance,
  createMonthlyOverview,
  addSupporterDonation,
  addDistributionRecord,
  updateSupporterDonation,
  updateDistributionRecord,
  removeSupporterDonation,
  removeDistributionRecord,
  updateMonthlyExchangeRate,
} from "@/features/monthly-overview/domain";
import {
  findMonthlyOverview,
  findPreviousMonthOverview,
  createMonthlyOverview as createMonthlyOverviewData,
  createSupporterDonation as createSupporterDonationData,
  createDistributionRecord as createDistributionRecordData,
  updateExchangeRate as updateExchangeRateData,
  updateSupporterDonation as updateSupporterDonationData,
  softDeleteSupporterDonation as softDeleteSupporterDonationData,
  updateDistributionRecord as updateDistributionRecordData,
  softDeleteDistributionRecord as softDeleteDistributionRecordData,
} from "@/features/monthly-overview/data";

const mockFindMonthlyOverview = vi.mocked(findMonthlyOverview);
const mockFindPreviousMonthOverview = vi.mocked(findPreviousMonthOverview);
const mockCreateMonthlyOverview = vi.mocked(createMonthlyOverviewData);
const mockCreateSupporterDonation = vi.mocked(createSupporterDonationData);
const mockCreateDistributionRecord = vi.mocked(createDistributionRecordData);
const mockUpdateExchangeRate = vi.mocked(updateExchangeRateData);
const mockUpdateSupporterDonation = vi.mocked(updateSupporterDonationData);
const mockSoftDeleteSupporterDonation = vi.mocked(softDeleteSupporterDonationData);
const mockUpdateDistributionRecord = vi.mocked(updateDistributionRecordData);
const mockSoftDeleteDistributionRecord = vi.mocked(softDeleteDistributionRecordData);

const now = new Date();

function makeOverview(overrides: Record<string, unknown> = {}) {
  return {
    id: "overview-1",
    year: 2025,
    month: 6,
    exchangeRate: 30.5,
    carryOver: BigInt(50000),
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    supporterDonations: [
      {
        id: "s1",
        monthlyOverviewId: "overview-1",
        name: "Taro",
        amount: BigInt(10000),
        currency: "JPY",
        kyatAmount: BigInt(305000),
        deletedAt: null,
        createdAt: now,
      },
      {
        id: "s2",
        monthlyOverviewId: "overview-1",
        name: "Hanako",
        amount: BigInt(200000),
        currency: "MMK",
        kyatAmount: BigInt(200000),
        deletedAt: null,
        createdAt: now,
      },
    ],
    distributionRecords: [
      {
        id: "d1",
        monthlyOverviewId: "overview-1",
        donationPlaceId: "place-1",
        recipient: "Temple A",
        amountMMK: BigInt(100000),
        remarks: null,
        deletedAt: null,
        createdAt: now,
      },
    ],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getMonthlyOverview", () => {
  it("returns serialized overview with correct balance calculation", async () => {
    const overview = makeOverview();
    mockFindMonthlyOverview.mockResolvedValue(overview);

    const result = await getMonthlyOverview({ year: 2025, month: 6 });

    // carryOver(50000) + totalCollected(305000 + 200000) - totalDonated(100000) = 455000
    expect(result.carryOver).toBe("50000");
    expect(result.totalCollected).toBe("505000");
    expect(result.totalDonated).toBe("100000");
    expect(result.remainingBalance).toBe("455000");
    expect(result.supporters).toHaveLength(2);
    expect(result.distributions).toHaveLength(1);
  });

  it("serializes BigInt values as strings", async () => {
    mockFindMonthlyOverview.mockResolvedValue(makeOverview());

    const result = await getMonthlyOverview({ year: 2025, month: 6 });

    expect(typeof result.carryOver).toBe("string");
    expect(typeof result.totalCollected).toBe("string");
    expect(typeof result.totalDonated).toBe("string");
    expect(typeof result.remainingBalance).toBe("string");
    expect(typeof result.supporters[0].amount).toBe("string");
    expect(typeof result.supporters[0].kyatAmount).toBe("string");
    expect(typeof result.distributions[0].amountMMK).toBe("string");
  });

  it("handles zero donations (empty month)", async () => {
    mockFindMonthlyOverview.mockResolvedValue(
      makeOverview({
        supporterDonations: [],
        distributionRecords: [],
      }),
    );

    const result = await getMonthlyOverview({ year: 2025, month: 6 });

    expect(result.totalCollected).toBe("0");
    expect(result.totalDonated).toBe("0");
    expect(result.remainingBalance).toBe("50000"); // just carry over
  });

  it("throws VALIDATION_ERROR for invalid input", async () => {
    try {
      await getMonthlyOverview({ year: "abc", month: 6 });
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(MonthlyOverviewError);
      expect((e as MonthlyOverviewError).code).toBe("VALIDATION_ERROR");
    }
  });

  it("throws MONTH_NOT_FOUND when overview does not exist", async () => {
    mockFindMonthlyOverview.mockResolvedValue(null);

    try {
      await getMonthlyOverview({ year: 2025, month: 6 });
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(MonthlyOverviewError);
      expect((e as MonthlyOverviewError).code).toBe("MONTH_NOT_FOUND");
    }
  });
});

describe("getPreviousMonthBalance", () => {
  it("returns remaining balance of previous month", async () => {
    // carryOver(50000) + collected(505000) - donated(100000) = 455000
    mockFindPreviousMonthOverview.mockResolvedValue(makeOverview());

    const result = await getPreviousMonthBalance({ year: 2025, month: 7 });
    expect(result).toBe("455000");
  });

  it("returns '0' when no previous month exists", async () => {
    mockFindPreviousMonthOverview.mockResolvedValue(null);

    const result = await getPreviousMonthBalance({ year: 2025, month: 1 });
    expect(result).toBe("0");
  });

  it("returns '0' for invalid input", async () => {
    const result = await getPreviousMonthBalance({ year: "abc", month: 1 });
    expect(result).toBe("0");
  });
});

describe("createMonthlyOverview", () => {
  it("creates a new overview successfully", async () => {
    mockFindMonthlyOverview.mockResolvedValue(null);
    mockCreateMonthlyOverview.mockResolvedValue({
      id: "new-overview",
      year: 2025,
      month: 7,
      exchangeRate: 30.5,
      carryOver: BigInt(100000),
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
      supporterDonations: [],
      distributionRecords: [],
    });

    const result = await createMonthlyOverview({
      year: 2025,
      month: 7,
      exchangeRate: 30.5,
      carryOver: 100000,
    });

    expect(result.id).toBe("new-overview");
    expect(result.year).toBe(2025);
    expect(result.month).toBe(7);
  });

  it("throws DUPLICATE_MONTH if overview already exists", async () => {
    mockFindMonthlyOverview.mockResolvedValue(makeOverview());

    try {
      await createMonthlyOverview({
        year: 2025,
        month: 6,
        exchangeRate: 30.5,
        carryOver: 0,
      });
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(MonthlyOverviewError);
      expect((e as MonthlyOverviewError).code).toBe("DUPLICATE_MONTH");
    }
  });

  it("throws VALIDATION_ERROR for invalid input", async () => {
    try {
      await createMonthlyOverview({
        year: 2025,
        month: 13, // invalid
        exchangeRate: 30.5,
        carryOver: 0,
      });
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(MonthlyOverviewError);
      expect((e as MonthlyOverviewError).code).toBe("VALIDATION_ERROR");
    }
  });
});

describe("updateMonthlyExchangeRate", () => {
  it("returns updated overview with recalculated balances", async () => {
    mockUpdateExchangeRate.mockResolvedValue(makeOverview({ exchangeRate: 35 }));

    const result = await updateMonthlyExchangeRate({
      id: "overview-1",
      exchangeRate: 35,
    });

    expect(result.exchangeRate).toBe(35);
    expect(result.id).toBe("overview-1");
  });

  it("throws OVERVIEW_NOT_FOUND when update returns null", async () => {
    mockUpdateExchangeRate.mockResolvedValue(null);

    try {
      await updateMonthlyExchangeRate({ id: "missing", exchangeRate: 35 });
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(MonthlyOverviewError);
      expect((e as MonthlyOverviewError).code).toBe("OVERVIEW_NOT_FOUND");
    }
  });

  it("throws VALIDATION_ERROR for invalid input", async () => {
    try {
      await updateMonthlyExchangeRate({ id: "", exchangeRate: 35 });
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(MonthlyOverviewError);
      expect((e as MonthlyOverviewError).code).toBe("VALIDATION_ERROR");
    }
  });
});

describe("addSupporterDonation", () => {
  it("creates a supporter donation successfully", async () => {
    mockCreateSupporterDonation.mockResolvedValue({
      id: "new-s",
      monthlyOverviewId: "overview-1",
      name: "New Donor",
      amount: BigInt(5000),
      currency: "JPY",
      kyatAmount: BigInt(152500),
      deletedAt: null,
      createdAt: now,
    });

    const result = await addSupporterDonation({
      monthlyOverviewId: "overview-1",
      name: "New Donor",
      amount: 5000,
      currency: "JPY",
      kyatAmount: 152500,
    });

    expect(result.id).toBe("new-s");
    expect(result.name).toBe("New Donor");
    expect(result.amount).toBe("5000");
    expect(result.kyatAmount).toBe("152500");
  });

  it("throws VALIDATION_ERROR for missing name", async () => {
    try {
      await addSupporterDonation({
        monthlyOverviewId: "overview-1",
        name: "",
        amount: 5000,
        currency: "JPY",
        kyatAmount: 152500,
      });
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(MonthlyOverviewError);
      expect((e as MonthlyOverviewError).code).toBe("VALIDATION_ERROR");
    }
  });
});

describe("addDistributionRecord", () => {
  it("creates a distribution record successfully", async () => {
    mockCreateDistributionRecord.mockResolvedValue({
      id: "new-d",
      monthlyOverviewId: "overview-1",
      donationPlaceId: "place-1",
      recipient: "Temple B",
      amountMMK: BigInt(75000),
      remarks: "Monthly donation",
      deletedAt: null,
      createdAt: now,
    });

    const result = await addDistributionRecord({
      monthlyOverviewId: "overview-1",
      donationPlaceId: "place-1",
      recipient: "Temple B",
      amountMMK: 75000,
      remarks: "Monthly donation",
    });

    expect(result.id).toBe("new-d");
    expect(result.amountMMK).toBe("75000");
    expect(result.remarks).toBe("Monthly donation");
  });

  it("throws VALIDATION_ERROR for empty recipient", async () => {
    try {
      await addDistributionRecord({
        monthlyOverviewId: "overview-1",
        donationPlaceId: "place-1",
        recipient: "",
        amountMMK: 75000,
      });
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(MonthlyOverviewError);
      expect((e as MonthlyOverviewError).code).toBe("VALIDATION_ERROR");
    }
  });
});

describe("updateSupporterDonation", () => {
  it("updates a supporter donation successfully", async () => {
    mockUpdateSupporterDonation.mockResolvedValue({
      id: "s1",
      monthlyOverviewId: "overview-1",
      name: "Updated Name",
      amount: BigInt(20000),
      currency: "JPY",
      kyatAmount: BigInt(610000),
      deletedAt: null,
      createdAt: now,
    });

    const result = await updateSupporterDonation({
      id: "s1",
      name: "Updated Name",
      amount: 20000,
      currency: "JPY",
      kyatAmount: 610000,
    });

    expect(result.name).toBe("Updated Name");
    expect(result.amount).toBe("20000");
  });

  it("throws RECORD_NOT_FOUND when donation does not exist", async () => {
    mockUpdateSupporterDonation.mockRejectedValue(new Error("Not found"));

    try {
      await updateSupporterDonation({
        id: "missing",
        name: "Name",
        amount: 1000,
        currency: "JPY",
        kyatAmount: 30500,
      });
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(MonthlyOverviewError);
      expect((e as MonthlyOverviewError).code).toBe("RECORD_NOT_FOUND");
    }
  });
});

describe("updateDistributionRecord", () => {
  it("updates a distribution record successfully", async () => {
    mockUpdateDistributionRecord.mockResolvedValue({
      id: "d1",
      monthlyOverviewId: "overview-1",
      donationPlaceId: "place-2",
      recipient: "Updated Temple",
      amountMMK: BigInt(150000),
      remarks: "Updated",
      deletedAt: null,
      createdAt: now,
    });

    const result = await updateDistributionRecord({
      id: "d1",
      donationPlaceId: "place-2",
      recipient: "Updated Temple",
      amountMMK: 150000,
      remarks: "Updated",
    });

    expect(result.recipient).toBe("Updated Temple");
    expect(result.amountMMK).toBe("150000");
  });

  it("throws RECORD_NOT_FOUND when record does not exist", async () => {
    mockUpdateDistributionRecord.mockRejectedValue(new Error("Not found"));

    try {
      await updateDistributionRecord({
        id: "missing",
        donationPlaceId: "place-1",
        recipient: "Temple",
        amountMMK: 100000,
      });
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(MonthlyOverviewError);
      expect((e as MonthlyOverviewError).code).toBe("RECORD_NOT_FOUND");
    }
  });
});

describe("removeSupporterDonation", () => {
  it("deletes a donation successfully", async () => {
    mockSoftDeleteSupporterDonation.mockResolvedValue(undefined as never);

    await expect(removeSupporterDonation("s1")).resolves.toBeUndefined();
    expect(mockSoftDeleteSupporterDonation).toHaveBeenCalledWith("s1");
  });

  it("throws VALIDATION_ERROR for empty id", async () => {
    try {
      await removeSupporterDonation("");
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(MonthlyOverviewError);
      expect((e as MonthlyOverviewError).code).toBe("VALIDATION_ERROR");
    }
  });

  it("throws RECORD_NOT_FOUND when donation does not exist", async () => {
    mockSoftDeleteSupporterDonation.mockRejectedValue(new Error("Not found"));

    try {
      await removeSupporterDonation("missing");
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(MonthlyOverviewError);
      expect((e as MonthlyOverviewError).code).toBe("RECORD_NOT_FOUND");
    }
  });
});

describe("removeDistributionRecord", () => {
  it("deletes a record successfully", async () => {
    mockSoftDeleteDistributionRecord.mockResolvedValue(undefined as never);

    await expect(removeDistributionRecord("d1")).resolves.toBeUndefined();
    expect(mockSoftDeleteDistributionRecord).toHaveBeenCalledWith("d1");
  });

  it("throws VALIDATION_ERROR for empty id", async () => {
    try {
      await removeDistributionRecord("");
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(MonthlyOverviewError);
      expect((e as MonthlyOverviewError).code).toBe("VALIDATION_ERROR");
    }
  });

  it("throws RECORD_NOT_FOUND when record does not exist", async () => {
    mockSoftDeleteDistributionRecord.mockRejectedValue(new Error("Not found"));

    try {
      await removeDistributionRecord("missing");
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(MonthlyOverviewError);
      expect((e as MonthlyOverviewError).code).toBe("RECORD_NOT_FOUND");
    }
  });
});
