"use client";

import { useTranslations } from "next-intl";
import { ScrollText } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActivityLogTableRow } from "./ActivityLogTableRow";
import type { ActivityLog } from "@/features/activity-log/types";

type ActivityLogTableProps = {
  logs: ActivityLog[];
};

function EmptyState() {
  const t = useTranslations("activityLogs");
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted mb-4 flex size-12 items-center justify-center rounded-lg">
        <ScrollText className="text-muted-foreground size-6" />
      </div>
      <h3 className="text-sm font-medium">{t("empty")}</h3>
      <p className="text-muted-foreground mt-1 text-sm">
        {t("emptyDescription")}
      </p>
    </div>
  );
}

export function ActivityLogTable({ logs }: ActivityLogTableProps) {
  const t = useTranslations("activityLogs");

  if (logs.length === 0) {
    return <EmptyState />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>{t("table.timestamp")}</TableHead>
          <TableHead>{t("table.user")}</TableHead>
          <TableHead>{t("table.action")}</TableHead>
          <TableHead>{t("table.details")}</TableHead>
          <TableHead>{t("table.ipAddress")}</TableHead>
          <TableHead>{t("table.status")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <ActivityLogTableRow key={log.id} log={log} />
        ))}
      </TableBody>
    </Table>
  );
}
