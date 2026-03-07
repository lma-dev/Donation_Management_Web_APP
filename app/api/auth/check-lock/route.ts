import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  email: z.string().email(),
});

const MIN_RESPONSE_MS = 200;

export async function GET(request: Request) {
  const start = Date.now();
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ email: searchParams.get("email") });

  if (!parsed.success) {
    await delay(MIN_RESPONSE_MS - (Date.now() - start));
    return NextResponse.json({ isLocked: false });
  }

  const user = await prisma.user.findFirst({
    where: { email: parsed.data.email, deletedAt: null },
    select: { isLocked: true },
  });

  // Constant-time response to prevent timing-based email enumeration.
  await delay(MIN_RESPONSE_MS - (Date.now() - start));

  // Return isLocked only if the user actually exists and is locked.
  // For non-existent users, return false (same as unlocked) to prevent email enumeration.
  return NextResponse.json({ isLocked: user?.isLocked === true });
}

function delay(ms: number): Promise<void> {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}
