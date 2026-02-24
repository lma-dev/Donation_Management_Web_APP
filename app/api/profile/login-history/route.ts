import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(params.get("pageSize") ?? "5")));

  const where = {
    userId: session.user.id,
    actionType: { in: ["Login", "Login Failed"] },
  };

  const [data, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        timestamp: true,
        actionType: true,
        ipAddress: true,
        status: true,
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, pageSize });
}
