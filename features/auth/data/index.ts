import { prisma } from "@/lib/prisma";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function updateFailedAttempts(
  userId: string,
  attempts: number,
  shouldLock: boolean,
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: attempts,
      ...(shouldLock ? { isLocked: true, lockedAt: new Date() } : {}),
    },
  });
}

export async function resetFailedAttempts(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0 },
  });
}
