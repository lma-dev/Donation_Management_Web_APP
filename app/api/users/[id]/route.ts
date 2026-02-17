import { NextResponse } from "next/server";
import { editUser, removeUser } from "@/features/user-management/domain";
import { UserError } from "@/features/user-management/error";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const user = await editUser(id, body);
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
  try {
    const { id } = await params;
    await removeUser(id);
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
