import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/features/auth/data";
import { AuthError } from "@/features/auth/error";

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user || !user.password) {
    throw new AuthError("User not found", "USER_NOT_FOUND");
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new AuthError("Invalid credentials", "INVALID_CREDENTIALS");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
