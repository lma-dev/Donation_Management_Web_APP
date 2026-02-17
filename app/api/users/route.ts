import { NextResponse } from "next/server";
import { listUsers, registerUser } from "@/features/user-management/domain";
import { UserError } from "@/features/user-management/error";

export async function GET() {
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
  try {
    const body = await request.json();
    const user = await registerUser(body);
    return NextResponse.json(user, { status: 201 });
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
