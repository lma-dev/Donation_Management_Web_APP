import { NextRequest, NextResponse } from "next/server";
import {
  addSupporterDonation,
  updateSupporterDonation,
  removeSupporterDonation,
} from "@/features/monthly-overview/domain";
import { MonthlyOverviewError } from "@/features/monthly-overview/error";
import { logAction } from "@/lib/activity-log";
import { requireRole } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  const { error: authError } = await requireRole("ADMIN");
  if (authError) return authError;

  try {
    const body = await request.json();
    const data = await addSupporterDonation(body);
    await logAction({
      actionType: "Added",
      actionLabel: "Supporter Donation Added",
      details: `Added supporter donation: ${body.supporterName ?? "Unknown supporter"}`,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof MonthlyOverviewError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create supporter donation" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const { error: authError } = await requireRole("ADMIN");
  if (authError) return authError;

  try {
    const body = await request.json();
    const data = await updateSupporterDonation(body);
    await logAction({
      actionType: "Updated",
      actionLabel: "Supporter Donation Updated",
      details: `Updated supporter donation: ${body.name ?? "Unknown supporter"}`,
    });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof MonthlyOverviewError) {
      const status = error.code === "RECORD_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Failed to update supporter donation" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { error: authError } = await requireRole("ADMIN");
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 },
      );
    }
    await removeSupporterDonation(id);
    await logAction({
      actionType: "Deleted",
      actionLabel: "Supporter Donation Soft Deleted",
      details: `Soft deleted supporter donation: ${id}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof MonthlyOverviewError) {
      const status = error.code === "RECORD_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Failed to delete supporter donation" },
      { status: 500 },
    );
  }
}
