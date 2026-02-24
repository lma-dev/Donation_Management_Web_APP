"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "./api-client";
import type { DashboardResponse } from "./types";

export function useDashboardData() {
  const query = useQuery<DashboardResponse>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
