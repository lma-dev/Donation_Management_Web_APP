import { NextResponse } from "next/server";
import { lockUser, unlockUser } from "@/features/user-management/domain";
import { UserError } from "@/features/user-management/error";
import { logAction } from "@/lib/activity-log";
import { requireRole } from "@/lib/api-auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authError, session } = await requireRole("ADMIN");
  if (authError) return authError;

  try {
    const { id } = await params;
    await lockUser(id, session!.user.id);
    await logAction({
      actionType: "Updated",
      actionLabel: "User Locked",
      details: `Locked user account: ${id}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof UserError) {
      const status = error.code === "USER_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Failed to lock user" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authError } = await requireRole("ADMIN");
  if (authError) return authError;

  try {
    const { id } = await params;
    await unlockUser(id);
    await logAction({
      actionType: "Updated",
      actionLabel: "User Unlocked",
      details: `Unlocked user account: ${id}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof UserError) {
      const status = error.code === "USER_NOT_FOUND" ? 404 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Failed to unlock user" },
      { status: 500 },
    );
  }
}
