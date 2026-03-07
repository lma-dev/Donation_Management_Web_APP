import { NextResponse } from "next/server";
import { getActivityLogSummary } from "@/features/activity-log/domain";
import { requireRole } from "@/lib/api-auth";

export async function GET() {
  const { error: authError } = await requireRole("SYSTEM_ADMIN");
  if (authError) return authError;

  try {
    const summary = await getActivityLogSummary();
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch activity log summary" },
      { status: 500 },
    );
  }
}
