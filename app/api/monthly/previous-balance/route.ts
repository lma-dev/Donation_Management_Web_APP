import { NextRequest, NextResponse } from "next/server";
import { getPreviousMonthBalance } from "@/features/monthly-overview/domain";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    if (!year || !month) {
      return NextResponse.json(
        { error: "Both year and month are required" },
        { status: 400 },
      );
    }

    const balance = await getPreviousMonthBalance({ year, month });
    return NextResponse.json({ balance });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch previous month balance" },
      { status: 500 },
    );
  }
}
