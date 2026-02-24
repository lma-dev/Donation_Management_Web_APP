import { NextResponse } from "next/server";
import { editUser, removeUser } from "@/features/user-management/domain";
import { UserError } from "@/features/user-management/error";
import { logAction } from "@/lib/activity-log";
import { requireRole } from "@/lib/api-auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error: authError } = await requireRole("ADMIN");
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const user = await editUser(id, body);
    await logAction({
      actionType: "Updated",
      actionLabel: "User Updated",
      details: `Updated user: ${body.name ?? body.email ?? id}`,
    });
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof UserError) {
      const status =
        error.code === "USER_NOT_FOUND"
          ? 404
          : error.code === "EMAIL_ALREADY_EXISTS"
            ? 409
            : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Failed to update user" },
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
    await removeUser(id);
    await logAction({
      actionType: "Deleted",
      actionLabel: "User Soft Deleted",
      details: `Soft deleted user with ID: ${id}`,
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
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
