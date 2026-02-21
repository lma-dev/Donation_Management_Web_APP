import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await prisma.activityLog.findMany({
    where: {
      userId: session.user.id,
      actionType: { in: ["Login", "Login Failed"] },
    },
    orderBy: { timestamp: "desc" },
    take: 10,
    select: {
      id: true,
      timestamp: true,
      actionType: true,
      ipAddress: true,
      status: true,
    },
  });

  return NextResponse.json(logs);
}
