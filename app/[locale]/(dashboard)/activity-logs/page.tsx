"use client";

import { Download, RefreshCw, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageContent } from "@/components/layout/PageContent";
import { ActivityLogSearch } from "@/components/activity-log/ActivityLogSearch";
import { ActivityLogFilters } from "@/components/activity-log/ActivityLogFilters";
import { ActivityLogTable } from "@/components/activity-log/ActivityLogTable";
import { ActivityLogSummaryCards } from "@/components/activity-log/ActivityLogSummaryCards";
import { useActivityLogData } from "@/features/activity-log/use-activity-log-data";
import { exportActivityLogsCsv } from "@/features/activity-log/api-client";
import { PAGE_SIZE } from "@/features/activity-log/atoms";

export default function ActivityLogsPage() {
  const {
    logs,
    total,
    totalPages,
    page,
    isLoading,
    summary,
    isSummaryLoading,
    search,
    setSearch,
    actionType,
    setActionType,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    clearFilters,
    setPage,
    refetch,
    exportParams,
  } = useActivityLogData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  return (
    <PageContent
      title="System Activity Logs"
      description="Monitor and audit all administrative actions, system updates, and security events. Data is retained for 90 days."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportActivityLogsCsv(exportParams)}
          >
            <Download className="mr-1 size-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="mr-1 size-4" />
            Refresh
          </Button>
        </div>
      }
    >
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <ActivityLogSearch value={search} onChange={setSearch} />
        <ActivityLogFilters
          dateFrom={dateFrom}
          dateTo={dateTo}
          actionType={actionType}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onActionTypeChange={setActionType}
          onClearAll={clearFilters}
        />
      </div>

      {/* Table Card */}
      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          <ActivityLogTable logs={logs} />
        </CardContent>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
            <p className="text-muted-foreground text-sm">
              Showing{" "}
              <span className="text-foreground font-medium">
                {(page - 1) * PAGE_SIZE + 1}
              </span>{" "}
              to{" "}
              <span className="text-foreground font-medium">
                {Math.min(page * PAGE_SIZE, total)}
              </span>{" "}
              of{" "}
              <span className="text-foreground font-medium">{total}</span>{" "}
              logs
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft />
                <span className="sr-only">Previous page</span>
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Summary Cards */}
      <ActivityLogSummaryCards
        summary={summary}
        isLoading={isSummaryLoading}
      />
    </PageContent>
  );
}
