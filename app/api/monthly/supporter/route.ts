import { NextRequest, NextResponse } from "next/server";
import { addSupporterDonation } from "@/features/monthly-overview/domain";
import { MonthlyOverviewError } from "@/features/monthly-overview/error";
import { logAction } from "@/lib/activity-log";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await addSupporterDonation(body);
    await logAction({
      actionType: "Added",
      actionLabel: "Supporter Donation Added",
      details: `Added supporter donation: ${body.supporterName ?? "Unknown supporter"}`,
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
      { error: "Failed to create supporter donation" },
      { status: 500 },
    );
  }
}
