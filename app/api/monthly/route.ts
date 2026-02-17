import { NextRequest, NextResponse } from "next/server";
import {
  getMonthlyOverview,
  createMonthlyOverview,
} from "@/features/monthly-overview/domain";
import { MonthlyOverviewError } from "@/features/monthly-overview/error";

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

    const data = await getMonthlyOverview({ year, month });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof MonthlyOverviewError) {
      const status = error.code === "MONTH_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch monthly overview" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await createMonthlyOverview(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof MonthlyOverviewError) {
      const status = error.code === "DUPLICATE_MONTH" ? 409 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Failed to create monthly overview" },
      { status: 500 },
    );
  }
}
