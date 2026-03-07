import { NextResponse } from "next/server";
import { getDashboardData } from "@/features/dashboard/domain";
import { requireRole } from "@/lib/api-auth";

export async function GET() {
  const { error: authError } = await requireRole("USER");
  if (authError) return authError;

  try {
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
