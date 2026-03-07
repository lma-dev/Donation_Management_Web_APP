import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ isLocked: false });
  }

  const user = await prisma.user.findUnique({
    where: { email, deletedAt: null },
    select: { isLocked: true },
  });

  // Return isLocked only if the user actually exists and is locked.
  // For non-existent users, return false (same as unlocked) to prevent email enumeration.
  return NextResponse.json({ isLocked: user?.isLocked === true });
}
