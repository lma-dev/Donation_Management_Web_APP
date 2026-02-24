"use client";

import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useState, useEffect } from "react";
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

  const yearsQuery = useQuery<{ years: number[] }>({
    queryKey: ["available-years"],
    queryFn: fetchAvailableYears,
  });

  useEffect(() => {
    if (selectedYear === null && yearsQuery.data?.years?.length) {
      setSelectedYear(yearsQuery.data.years[0]);
    }
  }, [selectedYear, yearsQuery.data, setSelectedYear]);

  const summaryQuery = useQuery<YearlySummaryResponse>({
    queryKey: ["yearly-summary", selectedYear],
    queryFn: () => fetchYearlySummary(selectedYear!),
    enabled: selectedYear !== null,
    retry: false,
  });

  async function handleExport(type: "excel" | "pdf" | "json") {
    if (selectedYear === null) return;
    setIsExporting(true);
    try {
      await downloadExport(selectedYear, type);
    } finally {
      setIsExporting(false);
    }
  }

  return {
    selectedYear: selectedYear ?? new Date().getFullYear(),
    setSelectedYear,
    summary: summaryQuery.data,
    isLoading:
      yearsQuery.isLoading || (selectedYear !== null && summaryQuery.isLoading),
    error: summaryQuery.error,
    availableYears: yearsQuery.data?.years ?? [],
    handleExport,
    isExporting,
  };
}
