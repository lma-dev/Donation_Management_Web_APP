import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/features/auth/schema";
import { requestPasswordReset } from "@/features/auth/domain";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    const { token, userName } = await requestPasswordReset(parsed.data.email);

    if (token && userName) {
      const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
      const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;
      await sendPasswordResetEmail(parsed.data.email, userName, resetUrl);
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
