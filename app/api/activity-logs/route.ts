import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listActivityLogs, logActivity } from "@/features/activity-log/domain";
import { ActivityLogError } from "@/features/activity-log/error";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const result = await listActivityLogs(params);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ActivityLogError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const log = await logActivity(body);
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    if (error instanceof ActivityLogError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create activity log" },
      { status: 500 },
    );
  }
}
