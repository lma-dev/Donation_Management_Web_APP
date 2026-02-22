import { NextRequest, NextResponse } from "next/server";
import {
  listDeletedDonationPlaces,
  restoreDonationPlace,
  purgeDonationPlace,
} from "@/features/donation-place/domain";
import { DonationPlaceError } from "@/features/donation-place/error";
import { logAction } from "@/lib/activity-log";
import { requireRole } from "@/lib/api-auth";

export async function GET() {
  const { error: authError } = await requireRole("ADMIN");
  if (authError) return authError;

  try {
    const places = await listDeletedDonationPlaces();
    return NextResponse.json(places);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch deleted donation places" },
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
      await restoreDonationPlace(id);
    }

    await logAction({
      actionType: "Restored",
      actionLabel: "Donation Places Restored",
      details: `Restored ${ids.length} donation place(s): ${ids.join(", ")}`,
    });

    return NextResponse.json({ success: true, restored: ids.length });
  } catch (error) {
    if (error instanceof DonationPlaceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to restore donation places" },
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
      await purgeDonationPlace(id);
    }

    await logAction({
      actionType: "Permanently Deleted",
      actionLabel: "Donation Places Permanently Deleted",
      details: `Permanently deleted ${ids.length} donation place(s): ${ids.join(", ")}`,
    });

    return NextResponse.json({ success: true, purged: ids.length });
  } catch (error) {
    if (error instanceof DonationPlaceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to permanently delete donation places" },
      { status: 500 },
    );
  }
}
