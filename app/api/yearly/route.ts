import { NextRequest, NextResponse } from "next/server";
import {
  getYearlySummary,
  listAvailableYears,
} from "@/features/yearly-summary/domain";
import { YearlySummaryError } from "@/features/yearly-summary/error";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");

    if (!year) {
      const years = await listAvailableYears();
      return NextResponse.json({ years });
    }

    const data = await getYearlySummary({ year });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof YearlySummaryError) {
      const status = error.code === "YEAR_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch yearly summary" },
      { status: 500 },
    );
  }
}
