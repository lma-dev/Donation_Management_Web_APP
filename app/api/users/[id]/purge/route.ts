import { NextResponse } from "next/server";
import { purgeUser } from "@/features/user-management/domain";
import { UserError } from "@/features/user-management/error";
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
    await purgeUser(id);
    await logAction({
      actionType: "Permanently Deleted",
      actionLabel: "User Permanently Deleted",
      details: `Permanently deleted user with ID: ${id}`,
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
      { error: "Failed to permanently delete user" },
      { status: 500 },
    );
  }
}
