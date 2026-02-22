import { NextResponse } from "next/server";
import {
  editDonationPlace,
  removeDonationPlace,
} from "@/features/donation-place/domain";
import { DonationPlaceError } from "@/features/donation-place/error";
import { logAction } from "@/lib/activity-log";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const place = await editDonationPlace(id, body);
    await logAction({
      actionType: "Updated",
      actionLabel: "Donation Place Updated",
      details: `Updated donation place: ${body.name ?? id}`,
    });
    return NextResponse.json(place);
  } catch (error) {
    if (error instanceof DonationPlaceError) {
      const status =
        error.code === "NOT_FOUND"
          ? 404
          : error.code === "DUPLICATE_NAME"
            ? 409
            : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Failed to update donation place" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await removeDonationPlace(id);
    await logAction({
      actionType: "Deleted",
      actionLabel: "Donation Place Soft Deleted",
      details: `Soft deleted donation place with ID: ${id}`,
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
      { error: "Failed to delete donation place" },
      { status: 500 },
    );
  }
}
