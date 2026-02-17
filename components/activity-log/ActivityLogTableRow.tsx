"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ActivityLog } from "@/features/activity-log/types";

const ACTION_COLORS: Record<string, string> = {
  Added: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Updated: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Deleted: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  Login: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
  "Login Failed": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "Changed Password": "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  Export: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  System: "bg-slate-100 text-slate-800 dark:bg-slate-800/30 dark:text-slate-400",
};

const STATUS_COLORS: Record<string, string> = {
  Success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Verified: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Alert: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ActivityLogTableRowProps = {
  log: ActivityLog;
};

export function ActivityLogTableRow({ log }: ActivityLogTableRowProps) {
  const isAlert = log.status === "Alert";

  return (
    <TableRow className={isAlert ? "bg-red-50/50 dark:bg-red-950/10" : ""}>
      <TableCell className="text-muted-foreground text-xs">
        {formatTimestamp(log.timestamp)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="size-7">
            <AvatarFallback className="text-[10px]">
              {getInitials(log.userName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{log.userName}</p>
            <p className="text-muted-foreground text-xs">{log.userRole}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className={ACTION_COLORS[log.actionLabel] ?? ""}
        >
          {log.actionLabel}
        </Badge>
      </TableCell>
      <TableCell className="max-w-[300px] truncate text-sm">
        {log.details}
      </TableCell>
      <TableCell className="text-muted-foreground text-xs font-mono">
        {log.ipAddress ?? "—"}
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className={STATUS_COLORS[log.status] ?? ""}
        >
          {log.status}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
