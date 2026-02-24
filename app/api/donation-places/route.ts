import { NextRequest, NextResponse } from "next/server";
import {
  listDonationPlaces,
  listActiveDonationPlaces,
  createDonationPlace,
} from "@/features/donation-place/domain";
import { DonationPlaceError } from "@/features/donation-place/error";
import { logAction } from "@/lib/activity-log";

export async function GET(request: NextRequest) {
  try {
    const activeOnly =
      request.nextUrl.searchParams.get("active") === "true";
    const places = activeOnly
      ? await listActiveDonationPlaces()
      : await listDonationPlaces();
    return NextResponse.json(places);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch donation places" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const place = await createDonationPlace(body);
    await logAction({
      actionType: "Added",
      actionLabel: "Donation Place Created",
      details: `Created donation place: ${body.name}`,
    });
    return NextResponse.json(place, { status: 201 });
  } catch (error) {
    if (error instanceof DonationPlaceError) {
      const status = error.code === "DUPLICATE_NAME" ? 409 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Failed to create donation place" },
      { status: 500 },
    );
  }
}
