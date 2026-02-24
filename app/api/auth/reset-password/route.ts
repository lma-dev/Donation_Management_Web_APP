import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resetPasswordWithToken } from "@/features/auth/domain";
import { AuthError } from "@/features/auth/error";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, newPassword, confirmPassword } = body;

    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await resetPasswordWithToken(
      token,
      newPassword,
      confirmPassword,
    );

    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    await prisma.activityLog.create({
      data: {
        userId: result.userId,
        userName: result.userName,
        userRole: result.userRole,
        actionType: "Password Reset",
        actionLabel: "Password Reset",
        details: `Password reset via forgot password for user: ${result.userName}`,
        ipAddress: ip,
        status: "Success",
      },
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
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
