import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAllActivityLogs } from "@/features/activity-log/domain";
import { ActivityLogError } from "@/features/activity-log/error";
import { logAction } from "@/lib/activity-log";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const logs = await getAllActivityLogs(params);

    const csvHeaders = ["Timestamp", "User Name", "User Role", "Action Type", "Action Label", "Details", "IP Address", "Status"];
    const csvRows: string[] = [csvHeaders.join(",")];

    for (const log of logs as Array<{ timestamp: Date; userName: string; userRole: string; actionType: string; actionLabel: string; details: string; ipAddress: string | null; status: string }>) {
      csvRows.push([
        new Date(log.timestamp).toISOString(),
        log.userName,
        log.userRole,
        log.actionType,
        log.actionLabel,
        `"${log.details.replace(/"/g, '""')}"`,
        log.ipAddress ?? "",
        log.status,
      ].join(","));
    }

    const csv = csvRows.join("\n");

    await logAction({
      actionType: "Export",
      actionLabel: "Activity Logs Exported",
      details: "Exported activity logs to CSV",
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="activity-logs-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof ActivityLogError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to export activity logs" },
      { status: 500 },
    );
  }
}
