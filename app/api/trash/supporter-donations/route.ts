import { NextRequest, NextResponse } from "next/server";
import {
  listDeletedSupporterDonations,
  restoreSupporterDonation,
  purgeSupporterDonation,
} from "@/features/monthly-overview/domain";
import { MonthlyOverviewError } from "@/features/monthly-overview/error";
import { logAction } from "@/lib/activity-log";
import { requireRole } from "@/lib/api-auth";

export async function GET() {
  const { error: authError } = await requireRole("ADMIN");
  if (authError) return authError;

  try {
    const donations = await listDeletedSupporterDonations();
    return NextResponse.json(donations);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch deleted supporter donations" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const { error: authError } = await requireRole("ADMIN");
  if (authError) return authError;

  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids array is required" },
        { status: 400 },
      );
    }

    for (const id of ids) {
      await restoreSupporterDonation(id);
    }

    await logAction({
      actionType: "Restored",
      actionLabel: "Supporter Donations Restored",
      details: `Restored ${ids.length} supporter donation(s): ${ids.join(", ")}`,
    });

    return NextResponse.json({ success: true, restored: ids.length });
  } catch (error) {
    if (error instanceof MonthlyOverviewError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to restore supporter donations" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { error: authError } = await requireRole("SYSTEM_ADMIN");
  if (authError) return authError;

  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids array is required" },
        { status: 400 },
      );
    }

    for (const id of ids) {
      await purgeSupporterDonation(id);
    }

    await logAction({
      actionType: "Permanently Deleted",
      actionLabel: "Supporter Donations Permanently Deleted",
      details: `Permanently deleted ${ids.length} supporter donation(s): ${ids.join(", ")}`,
    });

    return NextResponse.json({ success: true, purged: ids.length });
  } catch (error) {
    if (error instanceof MonthlyOverviewError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to permanently delete supporter donations" },
      { status: 500 },
    );
  }
}
