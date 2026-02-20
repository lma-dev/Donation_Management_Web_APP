import { NextRequest, NextResponse } from "next/server";
import { addDistributionRecord } from "@/features/monthly-overview/domain";
import { MonthlyOverviewError } from "@/features/monthly-overview/error";
import { logAction } from "@/lib/activity-log";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await addDistributionRecord(body);
    await logAction({
      actionType: "Added",
      actionLabel: "Distribution Record Added",
      details: `Added distribution record: ${body.recipient ?? "Unknown recipient"}`,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof MonthlyOverviewError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create distribution record" },
      { status: 500 },
    );
  }
}
