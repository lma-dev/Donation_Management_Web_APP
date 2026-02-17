"use client";

import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useState } from "react";
import { selectedYearAtom } from "./atoms";
import {
  fetchYearlySummary,
  fetchAvailableYears,
  downloadExport,
} from "./api-client";
import type { YearlySummaryResponse } from "./types";

export function useYearlyData() {
  const [selectedYear, setSelectedYear] = useAtom(selectedYearAtom);
  const [isExporting, setIsExporting] = useState(false);

  const summaryQuery = useQuery<YearlySummaryResponse>({
    queryKey: ["yearly-summary", selectedYear],
    queryFn: () => fetchYearlySummary(selectedYear),
  });

  const yearsQuery = useQuery<{ years: number[] }>({
    queryKey: ["available-years"],
    queryFn: fetchAvailableYears,
  });

  async function handleExport(type: "excel" | "pdf" | "json") {
    setIsExporting(true);
    try {
      await downloadExport(selectedYear, type);
    } finally {
      setIsExporting(false);
    }
  }

  return {
    selectedYear,
    setSelectedYear,
    summary: summaryQuery.data,
    isLoading: summaryQuery.isLoading,
    error: summaryQuery.error,
    availableYears: yearsQuery.data?.years ?? [],
    handleExport,
    isExporting,
  };
}
