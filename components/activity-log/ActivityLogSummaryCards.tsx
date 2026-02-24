"use client";

import { useTranslations } from "next-intl";
import { FileText, AlertTriangle, Users, Clock } from "lucide-react";
import { KpiCard } from "@/components/yearly/KpiCard";
import type { ActivityLogSummary } from "@/features/activity-log/types";

type ActivityLogSummaryCardsProps = {
  summary: ActivityLogSummary | undefined;
  isLoading: boolean;
};

export function ActivityLogSummaryCards({
  summary,
  isLoading,
}: ActivityLogSummaryCardsProps) {
  const t = useTranslations("activityLogs.summary");
  const tc = useTranslations("common");
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted/50 h-[108px] animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title={t("totalLogs")}
        value={summary.totalLogs30Days.toLocaleString()}
        icon={FileText}
      />
      <KpiCard
        title={t("criticalEvents")}
        value={summary.criticalEvents.toLocaleString()}
        icon={AlertTriangle}
        highlighted={summary.criticalEvents > 0}
        className={summary.criticalEvents > 0 ? "text-red-600 dark:text-red-400" : ""}
      />
      <KpiCard
        title={t("activeUsersToday")}
        value={summary.activeUsersToday.toLocaleString()}
        icon={Users}
      />
      <KpiCard
        title={t("retentionLeft")}
        value={`${summary.retentionDaysLeft} ${tc("days")}`}
        icon={Clock}
      />
    </div>
  );
}
