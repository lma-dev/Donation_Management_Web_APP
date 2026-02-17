"use client";

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
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted mb-4 flex size-12 items-center justify-center rounded-lg">
        <ScrollText className="text-muted-foreground size-6" />
      </div>
      <h3 className="text-sm font-medium">No activity logs found</h3>
      <p className="text-muted-foreground mt-1 text-sm">
        Try adjusting your filters or check back later.
      </p>
    </div>
  );
}

export function ActivityLogTable({ logs }: ActivityLogTableProps) {
  if (logs.length === 0) {
    return <EmptyState />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Timestamp</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>IP Address</TableHead>
          <TableHead>Status</TableHead>
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
