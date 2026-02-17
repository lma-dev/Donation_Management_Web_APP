import { prisma } from "@/lib/prisma";
import type { ActivityLogFiltersInput, CreateActivityLogInput } from "../schema";

export async function findActivityLogs(filters: ActivityLogFiltersInput) {
  const { search, dateFrom, dateTo, actionType, status, page, pageSize } = filters;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { userName: { contains: search, mode: "insensitive" } },
      { details: { contains: search, mode: "insensitive" } },
      { actionType: { contains: search, mode: "insensitive" } },
    ];
  }

  if (dateFrom || dateTo) {
    where.timestamp = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo + "T23:59:59.999Z") } : {}),
    };
  }

  if (actionType) {
    where.actionType = actionType;
  }

  if (status) {
    where.status = status;
  }

  const [data, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { data, total };
}

export async function findActivityLogSummary() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalLogs30Days, criticalEvents, activeUsersToday, oldestLog] =
    await Promise.all([
      prisma.activityLog.count({
        where: { timestamp: { gte: thirtyDaysAgo } },
      }),
      prisma.activityLog.count({
        where: {
          status: "Alert",
          timestamp: { gte: thirtyDaysAgo },
        },
      }),
      prisma.activityLog.findMany({
        where: { timestamp: { gte: todayStart } },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.activityLog.findFirst({
        orderBy: { timestamp: "asc" },
        select: { timestamp: true },
      }),
    ]);

  const retentionDaysLeft = oldestLog
    ? Math.max(
        0,
        90 - Math.floor((now.getTime() - oldestLog.timestamp.getTime()) / (24 * 60 * 60 * 1000)),
      )
    : 90;

  return {
    totalLogs30Days,
    criticalEvents,
    activeUsersToday: activeUsersToday.length,
    retentionDaysLeft,
  };
}

export async function findAllActivityLogs(filters: Omit<ActivityLogFiltersInput, "page" | "pageSize">) {
  const { search, dateFrom, dateTo, actionType, status } = filters;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { userName: { contains: search, mode: "insensitive" } },
      { details: { contains: search, mode: "insensitive" } },
      { actionType: { contains: search, mode: "insensitive" } },
    ];
  }

  if (dateFrom || dateTo) {
    where.timestamp = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo + "T23:59:59.999Z") } : {}),
    };
  }

  if (actionType) {
    where.actionType = actionType;
  }

  if (status) {
    where.status = status;
  }

  return prisma.activityLog.findMany({
    where,
    orderBy: { timestamp: "desc" },
  });
}

export async function createActivityLog(data: CreateActivityLogInput) {
  return prisma.activityLog.create({
    data: {
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      userId: data.userId,
      userName: data.userName,
      userRole: data.userRole,
      actionType: data.actionType,
      actionLabel: data.actionLabel,
      details: data.details,
      ipAddress: data.ipAddress,
      status: data.status,
    },
  });
}
