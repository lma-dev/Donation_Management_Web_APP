"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { selectedMonthlyYearAtom, selectedMonthlyMonthAtom } from "./atoms";
import {
  fetchMonthlyOverview,
  fetchPreviousMonthBalance,
  createMonthlyOverview,
  updateExchangeRate,
  createSupporterDonation,
  createDistributionRecord,
  updateSupporterDonation,
  deleteSupporterDonation,
  updateDistributionRecord,
  deleteDistributionRecord,
  downloadMonthlyExport,
} from "./api-client";
import type { MonthlyOverviewResponse } from "./types";

export function useMonthlyData() {
  const [selectedYear, setSelectedYear] = useAtom(selectedMonthlyYearAtom);
  const [selectedMonth, setSelectedMonth] = useAtom(selectedMonthlyMonthAtom);
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();
  const t = useTranslations("toast.monthly");

  const overviewQuery = useQuery<MonthlyOverviewResponse>({
    queryKey: ["monthly-overview", selectedYear, selectedMonth],
    queryFn: () => fetchMonthlyOverview(selectedYear, selectedMonth),
    retry: false,
  });

  const isNotFound = overviewQuery.error?.message?.includes("No data found");

  const previousBalanceQuery = useQuery<string>({
    queryKey: ["previous-month-balance", selectedYear, selectedMonth],
    queryFn: () => fetchPreviousMonthBalance(selectedYear, selectedMonth),
    enabled: isNotFound === true,
  });

  function invalidate() {
    queryClient.invalidateQueries({
      queryKey: ["monthly-overview", selectedYear, selectedMonth],
    });
    queryClient.invalidateQueries({
      queryKey: ["yearly-summary", selectedYear],
    });
    queryClient.invalidateQueries({
      queryKey: ["available-years"],
    });
  }

  async function handleCreateOverview(data: {
    exchangeRate: number;
    carryOver: number;
  }) {
    try {
      await createMonthlyOverview({
        year: selectedYear,
        month: selectedMonth,
        exchangeRate: data.exchangeRate,
        carryOver: data.carryOver,
      });
      invalidate();
      toast.success(t("createSuccess"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("createError"));
      throw error;
    }
  }

  async function handleUpdateExchangeRate(exchangeRate: number) {
    if (!overviewQuery.data) return;
    try {
      await updateExchangeRate({
        id: overviewQuery.data.id,
        exchangeRate,
      });
      invalidate();
      toast.success(t("updateRateSuccess"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("updateRateError"));
      throw error;
    }
  }

  async function handleAddSupporter(data: {
    name: string;
    amount: number;
    currency: string;
    kyatAmount: number;
  }) {
    if (!overviewQuery.data) return;
    try {
      await createSupporterDonation({
        monthlyOverviewId: overviewQuery.data.id,
        ...data,
      });
      invalidate();
      toast.success(t("addSupporterSuccess"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("addSupporterError"));
      throw error;
    }
  }

  async function handleAddDistribution(data: {
    recipient: string;
    donationPlaceId: string;
    amountMMK: number;
    remarks?: string;
  }) {
    if (!overviewQuery.data) return;
    try {
      await createDistributionRecord({
        monthlyOverviewId: overviewQuery.data.id,
        ...data,
      });
      invalidate();
      toast.success(t("addDistributionSuccess"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("addDistributionError"));
      throw error;
    }
  }

  async function handleUpdateSupporter(data: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    kyatAmount: number;
  }) {
    try {
      await updateSupporterDonation(data);
      invalidate();
      toast.success(t("updateSupporterSuccess"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("updateSupporterError"));
      throw error;
    }
  }

  async function handleDeleteSupporter(id: string) {
    try {
      await deleteSupporterDonation(id);
      invalidate();
      toast.success(t("deleteSupporterSuccess"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("deleteSupporterError"));
      throw error;
    }
  }

  async function handleUpdateDistribution(data: {
    id: string;
    donationPlaceId: string;
    recipient: string;
    amountMMK: number;
    remarks?: string;
  }) {
    try {
      await updateDistributionRecord(data);
      invalidate();
      toast.success(t("updateDistributionSuccess"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("updateDistributionError"));
      throw error;
    }
  }

  async function handleDeleteDistribution(id: string) {
    try {
      await deleteDistributionRecord(id);
      invalidate();
      toast.success(t("deleteDistributionSuccess"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("deleteDistributionError"));
      throw error;
    }
  }

  async function handleExport(type: "excel" | "pdf" | "json") {
    setIsExporting(true);
    try {
      await downloadMonthlyExport(selectedYear, selectedMonth, type);
      toast.success(t("exportSuccess"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("exportError"));
      throw error;
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
    isNotFound,
    previousBalance: previousBalanceQuery.data ?? "0",
    handleCreateOverview,
    handleUpdateExchangeRate,
    handleAddSupporter,
    handleAddDistribution,
    handleUpdateSupporter,
    handleDeleteSupporter,
    handleUpdateDistribution,
    handleDeleteDistribution,
    handleExport,
    isExporting,
  };
}
