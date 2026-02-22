import { NextRequest, NextResponse } from "next/server";
import { purgeDistributionRecord } from "@/features/monthly-overview/domain";
import { MonthlyOverviewError } from "@/features/monthly-overview/error";
import { logAction } from "@/lib/activity-log";
import { requireRole } from "@/lib/api-auth";

export async function DELETE(request: NextRequest) {
  const { error: authError } = await requireRole("SYSTEM_ADMIN");
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 },
      );
    }
    await purgeDistributionRecord(id);
    await logAction({
      actionType: "Permanently Deleted",
      actionLabel: "Distribution Record Permanently Deleted",
      details: `Permanently deleted distribution record: ${id}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof MonthlyOverviewError) {
      const status = error.code === "RECORD_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Failed to permanently delete distribution record" },
      { status: 500 },
    );
  }
}
