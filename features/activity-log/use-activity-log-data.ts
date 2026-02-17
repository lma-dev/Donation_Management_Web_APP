"use client";

import { useAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import {
  searchAtom,
  pageAtom,
  actionTypeFilterAtom,
  statusFilterAtom,
  dateFromAtom,
  dateToAtom,
  PAGE_SIZE,
} from "./atoms";
import { fetchActivityLogs, fetchActivityLogSummary } from "./api-client";

export function useActivityLogData() {
  const [search, setSearch] = useAtom(searchAtom);
  const [page, setPage] = useAtom(pageAtom);
  const [actionType, setActionType] = useAtom(actionTypeFilterAtom);
  const [status, setStatus] = useAtom(statusFilterAtom);
  const [dateFrom, setDateFrom] = useAtom(dateFromAtom);
  const [dateTo, setDateTo] = useAtom(dateToAtom);

  const params: Record<string, string> = {
    search,
    dateFrom,
    dateTo,
    actionType,
    status,
    page: String(page),
    pageSize: String(PAGE_SIZE),
  };

  const logsQuery = useQuery({
    queryKey: ["activity-logs", search, dateFrom, dateTo, actionType, status, page],
    queryFn: () => fetchActivityLogs(params),
  });

  const summaryQuery = useQuery({
    queryKey: ["activity-logs-summary"],
    queryFn: fetchActivityLogSummary,
  });

  function clearFilters() {
    setSearch("");
    setActionType("");
    setStatus("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  return {
    // Data
    logs: logsQuery.data?.data ?? [],
    total: logsQuery.data?.total ?? 0,
    totalPages: Math.max(1, Math.ceil((logsQuery.data?.total ?? 0) / PAGE_SIZE)),
    page,
    isLoading: logsQuery.isLoading,
    summary: summaryQuery.data,
    isSummaryLoading: summaryQuery.isLoading,

    // Filters
    search,
    setSearch: (v: string) => { setSearch(v); setPage(1); },
    actionType,
    setActionType: (v: string) => { setActionType(v); setPage(1); },
    status,
    setStatus: (v: string) => { setStatus(v); setPage(1); },
    dateFrom,
    setDateFrom: (v: string) => { setDateFrom(v); setPage(1); },
    dateTo,
    setDateTo: (v: string) => { setDateTo(v); setPage(1); },
    clearFilters,

    // Pagination
    setPage,

    // Refetch
    refetch: () => {
      logsQuery.refetch();
      summaryQuery.refetch();
    },

    // Export params (without page/pageSize)
    exportParams: {
      search,
      dateFrom,
      dateTo,
      actionType,
      status,
    } as Record<string, string>,
  };
}
