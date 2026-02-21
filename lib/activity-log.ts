import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

type LogParams = {
  actionType: string;
  actionLabel: string;
  details: string;
  status?: "Success" | "Alert";
};

export async function logAction({ actionType, actionLabel, details, status = "Success" }: LogParams) {
  const session = await auth();
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  const userName = session?.user?.name ?? "System";
  const userId = session?.user?.id ?? undefined;
  const userRole = session?.user?.role ?? "Unknown";

  await prisma.activityLog.create({
    data: {
      userId,
      userName,
      userRole,
      actionType,
      actionLabel,
      details,
      ipAddress: ip,
      status,
    },
  });
}
