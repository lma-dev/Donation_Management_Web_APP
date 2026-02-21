import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { changePassword } from "@/features/auth/domain";
import { AuthError } from "@/features/auth/error";
import { logAction } from "@/lib/activity-log";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    await changePassword(
      session.user.id,
      body.currentPassword,
      body.newPassword,
      body.confirmNewPassword,
    );

    await logAction({
      actionType: "Changed Password",
      actionLabel: "Password Changed",
      details: `User changed their password`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 },
    );
  }
}
