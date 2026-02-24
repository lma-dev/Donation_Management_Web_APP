import { NextResponse } from "next/server";
import { getActivityLogSummary } from "@/features/activity-log/domain";

export async function GET() {
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
