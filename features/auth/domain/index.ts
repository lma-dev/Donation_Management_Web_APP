import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  findUserByEmail,
  findUserById,
  updateFailedAttempts,
  resetFailedAttempts,
  updateUserPassword,
  createPasswordResetToken,
  findPasswordResetToken,
  deletePasswordResetToken,
} from "@/features/auth/data";
import { AuthError } from "@/features/auth/error";
import { changePasswordSchema, resetPasswordSchema } from "@/features/auth/schema";

const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const MAX_FAILED_ATTEMPTS = 5;

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user || !user.password) {
    throw new AuthError("User not found", "USER_NOT_FOUND");
  }

  if (user.isLocked) {
    throw new AuthError("Account is locked", "ACCOUNT_LOCKED");
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    const newAttempts = user.failedLoginAttempts + 1;
    const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;

    await updateFailedAttempts(user.id, newAttempts, shouldLock);

    if (shouldLock) {
      throw new AuthError(
        "Account locked due to too many failed attempts",
        "ACCOUNT_LOCKED",
      );
    }

    throw new AuthError("Invalid credentials", "INVALID_CREDENTIALS");
  }

  // Reset failed attempts on successful login
  if (user.failedLoginAttempts > 0) {
    await resetFailedAttempts(user.id);
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string,
) {
  const parsed = changePasswordSchema.safeParse({
    currentPassword,
    newPassword,
    confirmNewPassword,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new AuthError(firstError, "VALIDATION_ERROR");
  }

  const user = await findUserById(userId);

  if (!user || !user.password) {
    throw new AuthError("User not found", "USER_NOT_FOUND");
  }

  const isCurrentValid = await bcrypt.compare(currentPassword, user.password);

  if (!isCurrentValid) {
    throw new AuthError("Current password is incorrect", "WRONG_PASSWORD");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(userId, hashedPassword);
}

export async function requestPasswordReset(email: string) {
  const user = await findUserByEmail(email);

  // Always return silently to prevent email enumeration
  if (!user || !user.password) {
    return { token: null, userName: null };
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

  await createPasswordResetToken(email, token, expires);

  return { token, userName: user.name ?? "User" };
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
  confirmPassword: string,
) {
  const parsed = resetPasswordSchema.safeParse({
    token,
    newPassword,
    confirmPassword,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new AuthError(firstError, "VALIDATION_ERROR");
  }

  const record = await findPasswordResetToken(token);

  if (!record) {
    throw new AuthError("Invalid reset token", "TOKEN_INVALID");
  }

  if (record.expires < new Date()) {
    await deletePasswordResetToken(record.identifier, record.token);
    throw new AuthError("Reset token has expired", "TOKEN_EXPIRED");
  }

  const user = await findUserByEmail(record.identifier);

  if (!user) {
    throw new AuthError("User not found", "USER_NOT_FOUND");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(user.id, hashedPassword);
  await deletePasswordResetToken(record.identifier, record.token);

  // Also unlock the account and reset failed attempts if locked
  if (user.isLocked || user.failedLoginAttempts > 0) {
    await resetFailedAttempts(user.id);
  }

  return { userId: user.id, userName: user.name ?? "User", userRole: user.role };
}
