import { NextResponse } from "next/server";
import { listUsers, registerUser } from "@/features/user-management/domain";
import { UserError } from "@/features/user-management/error";
import { logAction } from "@/lib/activity-log";
import { requireRole } from "@/lib/api-auth";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET() {
  const { error: authError } = await requireRole("ADMIN");
  if (authError) return authError;

  try {
    const users = await listUsers();
    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const { error: authError } = await requireRole("ADMIN");
  if (authError) return authError;

  try {
    const body = await request.json();
    const user = await registerUser(body);
    await logAction({
      actionType: "Added",
      actionLabel: "User Registered",
      details: `Registered new user: ${body.name ?? body.email}`,
    });
    const emailSent = await sendWelcomeEmail(
      body.email,
      body.name ?? body.email,
      body.password,
    );
    return NextResponse.json({ ...user, emailSent }, { status: 201 });
  } catch (error) {
    if (error instanceof UserError) {
      const status = error.code === "EMAIL_ALREADY_EXISTS" ? 409 : 400;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status },
      );
    }
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}
