import { prisma } from "@/lib/prisma";
import type { Role } from "@/app/generated/prisma/enums";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isLocked: true,
  lockedAt: true,
  failedLoginAttempts: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function findAllUsers() {
  return prisma.user.findMany({
    where: { deletedAt: null },
    select: userSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: userSelect,
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email, deletedAt: null },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: Role;
}) {
  return prisma.user.create({
    data,
    select: userSelect,
  });
}

export async function updateUser(
  id: string,
  data: { name: string; email: string; password?: string; role?: Role },
) {
  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
}

export async function softDeleteUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function hardDeleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
  });
}

export async function lockUserInDb(id: string, lockedById: string) {
  return prisma.user.update({
    where: { id },
    data: {
      isLocked: true,
      lockedAt: new Date(),
      lockedBy: lockedById,
    },
    select: userSelect,
  });
}

export async function findDeletedUsers() {
  return prisma.user.findMany({
    where: { deletedAt: { not: null } },
    select: { ...userSelect, deletedAt: true },
    orderBy: { deletedAt: "desc" },
  });
}

export async function restoreUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: null },
    select: userSelect,
  });
}

export async function unlockUserInDb(id: string) {
  return prisma.user.update({
    where: { id },
    data: {
      isLocked: false,
      lockedAt: null,
      lockedBy: null,
      failedLoginAttempts: 0,
    },
    select: userSelect,
  });
}
