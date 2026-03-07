import { NextRequest, NextResponse } from "next/server";
import { updateMonthlyCarryOver } from "@/features/monthly-overview/domain";
import { MonthlyOverviewError } from "@/features/monthly-overview/error";
import { logAction } from "@/lib/activity-log";
import { requireRole } from "@/lib/api-auth";

export async function PATCH(request: NextRequest) {
  const { error: authError } = await requireRole("ADMIN");
  if (authError) return authError;

  try {
    const body = await request.json();
    const data = await updateMonthlyCarryOver(body);
    await logAction({
      actionType: "Updated",
      actionLabel: "Carry Over Updated",
      details: `Updated carry over to ${body.carryOver}`,
    });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof MonthlyOverviewError) {
      const status = error.code === "OVERVIEW_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Failed to update carry over" },
      { status: 500 },
    );
  }
}
