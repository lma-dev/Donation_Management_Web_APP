import { NextRequest, NextResponse } from "next/server";
import {
  listDeletedDistributionRecords,
  restoreDistributionRecord,
  purgeDistributionRecord,
} from "@/features/monthly-overview/domain";
import { MonthlyOverviewError } from "@/features/monthly-overview/error";
import { logAction } from "@/lib/activity-log";
import { requireRole } from "@/lib/api-auth";

export async function GET() {
  const { error: authError } = await requireRole("ADMIN");
  if (authError) return authError;

  try {
    const records = await listDeletedDistributionRecords();
    return NextResponse.json(records);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch deleted distribution records" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireRole("ADMIN");
  if (authError) return authError;

  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids array is required" },
        { status: 400 },
      );
    }

    for (const id of ids) {
      await restoreDistributionRecord(id);
    }

    await logAction({
      actionType: "Restored",
      actionLabel: "Distribution Records Restored",
      details: `Restored ${ids.length} distribution record(s): ${ids.join(", ")}`,
    });

    return NextResponse.json({ success: true, restored: ids.length });
  } catch (error) {
    if (error instanceof MonthlyOverviewError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to restore distribution records" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { error: authError } = await requireRole("SYSTEM_ADMIN");
  if (authError) return authError;

  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids array is required" },
        { status: 400 },
      );
    }

    for (const id of ids) {
      await purgeDistributionRecord(id);
    }

    await logAction({
      actionType: "Permanently Deleted",
      actionLabel: "Distribution Records Permanently Deleted",
      details: `Permanently deleted ${ids.length} distribution record(s): ${ids.join(", ")}`,
    });

    return NextResponse.json({ success: true, purged: ids.length });
  } catch (error) {
    if (error instanceof MonthlyOverviewError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to permanently delete distribution records" },
      { status: 500 },
    );
  }
}
