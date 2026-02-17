import bcrypt from "bcryptjs";
import { createUserSchema, updateUserSchema } from "../schema";
import {
  findAllUsers,
  findUserByEmail,
  findUserById,
  createUser as createUserInDb,
  updateUser as updateUserInDb,
  deleteUser as deleteUserInDb,
} from "../data";
import { UserError } from "../error";

export async function listUsers() {
  return findAllUsers();
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
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

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  return createUserInDb({
    name: parsed.data.name,
    email: parsed.data.email,
    password: hashedPassword,
  });
}

export async function editUser(
  userId: string,
  input: {
    name: string;
    email: string;
    password?: string;
    confirmPassword?: string;
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

  const updateData: { name: string; email: string; password?: string } = {
    name: parsed.data.name,
    email: parsed.data.email,
  };

  if (parsed.data.password && parsed.data.password.length > 0) {
    updateData.password = await bcrypt.hash(parsed.data.password, 10);
  }

  return updateUserInDb(userId, updateData);
}

export async function removeUser(userId: string) {
  const user = await findUserById(userId);
  if (!user) {
    throw new UserError("User not found", "USER_NOT_FOUND");
  }

  await deleteUserInDb(userId);
}
