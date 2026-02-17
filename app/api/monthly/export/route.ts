import { NextRequest, NextResponse } from "next/server";
import { generateMonthlyExportFile } from "@/features/monthly-overview/export";
import { MonthlyOverviewError } from "@/features/monthly-overview/error";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const type = searchParams.get("type");

    const result = await generateMonthlyExportFile({ year, month, type });

    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof MonthlyOverviewError) {
      const status =
        error.code === "MONTH_NOT_FOUND"
          ? 404
          : error.code === "EXPORT_GENERATION_FAILED"
            ? 500
            : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Failed to generate export" },
      { status: 500 },
    );
  }
}
