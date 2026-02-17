export type UserRole = "ADMIN" | "USER";

export type User = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

export type UserFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};
