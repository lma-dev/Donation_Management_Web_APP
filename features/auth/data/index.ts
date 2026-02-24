import { prisma } from "@/lib/prisma";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function updateUserPassword(id: string, hashedPassword: string) {
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
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

export async function createPasswordResetToken(
  email: string,
  token: string,
  expires: Date,
) {
  // Delete any existing tokens for this email first
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  return prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });
}

export async function findPasswordResetToken(token: string) {
  return prisma.verificationToken.findUnique({
    where: { token },
  });
}

export async function deletePasswordResetToken(
  identifier: string,
  token: string,
) {
  return prisma.verificationToken.delete({
    where: { identifier_token: { identifier, token } },
  });
}
