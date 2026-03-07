export type UserRole = "ADMIN" | "USER" | "SYSTEM_ADMIN";

export type User = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  isLocked: boolean;
  lockedAt: Date | null;
  failedLoginAttempts: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserFormData = {
  name: string;
  email: string;
  role: UserRole;
};

export type UpdateUserFormData = {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: UserRole;
};

export type UserFormData = CreateUserFormData | UpdateUserFormData;
