import { NextResponse } from "next/server";
import { purgeDonationPlace } from "@/features/donation-place/domain";
import { DonationPlaceError } from "@/features/donation-place/error";
import { logAction } from "@/lib/activity-log";
import { requireRole } from "@/lib/api-auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authError } = await requireRole("SYSTEM_ADMIN");
  if (authError) return authError;

  try {
    const { id } = await params;
    await purgeDonationPlace(id);
    await logAction({
      actionType: "Permanently Deleted",
      actionLabel: "Donation Place Permanently Deleted",
      details: `Permanently deleted donation place with ID: ${id}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof DonationPlaceError) {
      const status = error.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Failed to permanently delete donation place" },
      { status: 500 },
    );
  }
}
