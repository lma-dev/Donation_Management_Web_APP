import crypto from "crypto";
import bcrypt from "bcryptjs";
import { createUserSchema, updateUserSchema } from "../schema";
import {
  findAllUsers,
  findDeletedUsers,
  findDeletedUserById,
  findUserByEmail,
  findUserById,
  createUser as createUserInDb,
  updateUser as updateUserInDb,
  softDeleteUser as softDeleteUserInDb,
  hardDeleteUser as hardDeleteUserInDb,
  restoreUser as restoreUserInDb,
  lockUserInDb,
  unlockUserInDb,
} from "../data";
import { UserError } from "../error";
import type { Role } from "@/app/generated/prisma/enums";

export async function listUsers() {
  return findAllUsers();
}

function generateRandomPassword(length = 16): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const all = upper + lower + digits + special;

  // Ensure at least one of each required character type
  const required = [
    upper[crypto.randomInt(upper.length)],
    lower[crypto.randomInt(lower.length)],
    digits[crypto.randomInt(digits.length)],
    special[crypto.randomInt(special.length)],
  ];

  const remaining = Array.from({ length: length - required.length }, () =>
    all[crypto.randomInt(all.length)]
  );

  // Shuffle all characters together
  const chars = [...required, ...remaining];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

export async function registerUser(input: {
  name: string;
  email: string;
  role?: string;
}) {
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new UserError(firstError, "VALIDATION_ERROR");
  }

  const existing = await findUserByEmail(parsed.data.email);
  if (existing) {
    throw new UserError(
      "A user with this email already exists",
      "EMAIL_ALREADY_EXISTS",
    );
  }

  const plainPassword = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  const user = await createUserInDb({
    name: parsed.data.name,
    email: parsed.data.email,
    password: hashedPassword,
    role: (parsed.data.role as Role) ?? "USER",
  });

  return { ...user, generatedPassword: plainPassword };
}

export async function editUser(
  userId: string,
  input: {
    name: string;
    email: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
  },
) {
  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Validation failed";
    throw new UserError(firstError, "VALIDATION_ERROR");
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new UserError("User not found", "USER_NOT_FOUND");
  }

  if (parsed.data.email !== user.email) {
    const existing = await findUserByEmail(parsed.data.email);
    if (existing) {
      throw new UserError(
        "A user with this email already exists",
        "EMAIL_ALREADY_EXISTS",
      );
    }
  }

  const updateData: {
    name: string;
    email: string;
    password?: string;
    role?: Role;
  } = {
    name: parsed.data.name,
    email: parsed.data.email,
  };

  if (parsed.data.role) {
    updateData.role = parsed.data.role as Role;
  }

  if (parsed.data.password && parsed.data.password.length > 0) {
    updateData.password = await bcrypt.hash(parsed.data.password, 12);
  }

  return updateUserInDb(userId, updateData);
}

export async function removeUser(userId: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw new UserError("User not found", "USER_NOT_FOUND");
  }

  await softDeleteUserInDb(userId);
}

export async function listDeletedUsers() {
  return findDeletedUsers();
}

export async function restoreUser(userId: string) {
  await restoreUserInDb(userId);
}

export async function purgeUser(userId: string) {
  const user = await findDeletedUserById(userId);
  if (!user) {
    throw new UserError("User not found", "USER_NOT_FOUND");
  }

  await hardDeleteUserInDb(userId);
}

export async function lockUser(userId: string, lockedById: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw new UserError("User not found", "USER_NOT_FOUND");
  }
  if (user.isLocked) {
    throw new UserError("User is already locked", "ALREADY_LOCKED");
  }

  return lockUserInDb(userId, lockedById);
}

export async function unlockUser(userId: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw new UserError("User not found", "USER_NOT_FOUND");
  }
  if (!user.isLocked) {
    throw new UserError("User is not locked", "NOT_LOCKED");
  }

  return unlockUserInDb(userId);
}
