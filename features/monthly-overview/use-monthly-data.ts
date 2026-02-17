"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useState } from "react";
import { selectedMonthlyYearAtom, selectedMonthlyMonthAtom } from "./atoms";
import {
  fetchMonthlyOverview,
  createMonthlyOverview,
  createSupporterDonation,
  createDistributionRecord,
  downloadMonthlyExport,
} from "./api-client";
import type { MonthlyOverviewResponse } from "./types";

export function useMonthlyData() {
  const [selectedYear, setSelectedYear] = useAtom(selectedMonthlyYearAtom);
  const [selectedMonth, setSelectedMonth] = useAtom(selectedMonthlyMonthAtom);
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();

  const overviewQuery = useQuery<MonthlyOverviewResponse>({
    queryKey: ["monthly-overview", selectedYear, selectedMonth],
    queryFn: () => fetchMonthlyOverview(selectedYear, selectedMonth),
    retry: false,
  });

  function invalidate() {
    queryClient.invalidateQueries({
      queryKey: ["monthly-overview", selectedYear, selectedMonth],
    });
  }

  async function handleCreateOverview(data: { exchangeRate: number }) {
    await createMonthlyOverview({
      year: selectedYear,
      month: selectedMonth,
      exchangeRate: data.exchangeRate,
    });
    invalidate();
  }

  async function handleAddSupporter(data: {
    name: string;
    amount: number;
    currency: string;
    kyatAmount: number;
  }) {
    if (!overviewQuery.data) return;
    await createSupporterDonation({
      monthlyOverviewId: overviewQuery.data.id,
      ...data,
    });
    invalidate();
  }

  async function handleAddDistribution(data: {
    recipient: string;
    donationPlaceId: string;
    amountMMK: number;
    remarks?: string;
  }) {
    if (!overviewQuery.data) return;
    await createDistributionRecord({
      monthlyOverviewId: overviewQuery.data.id,
      ...data,
    });
    invalidate();
  }

  async function handleExport(type: "excel" | "pdf" | "json") {
    setIsExporting(true);
    try {
      await downloadMonthlyExport(selectedYear, selectedMonth, type);
    } finally {
      setIsExporting(false);
    }
  }

  return {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    overview: overviewQuery.data,
    isLoading: overviewQuery.isLoading,
    error: overviewQuery.error,
    isNotFound: overviewQuery.error?.message?.includes("No data found"),
    handleCreateOverview,
    handleAddSupporter,
    handleAddDistribution,
    handleExport,
    isExporting,
  };
}
