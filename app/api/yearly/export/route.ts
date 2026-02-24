import { NextRequest, NextResponse } from "next/server";
import { generateExportFile } from "@/features/yearly-summary/export";
import { YearlySummaryError } from "@/features/yearly-summary/error";
import { logAction } from "@/lib/activity-log";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const type = searchParams.get("type");

    const result = await generateExportFile({ year, type });

    await logAction({
      actionType: "Export",
      actionLabel: "Yearly Data Exported",
      details: `Exported yearly summary for ${year} as ${type?.toUpperCase() ?? "file"}`,
    });

    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof YearlySummaryError) {
      const status =
        error.code === "YEAR_NOT_FOUND"
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
