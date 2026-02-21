import bcrypt from "bcryptjs";
import {
  findUserByEmail,
  updateFailedAttempts,
  resetFailedAttempts,
} from "@/features/auth/data";
import { AuthError } from "@/features/auth/error";

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
