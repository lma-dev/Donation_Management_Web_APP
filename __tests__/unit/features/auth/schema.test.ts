import { describe, it, expect } from "vitest";
import { loginSchema, changePasswordSchema } from "@/features/auth/schema";

describe("loginSchema", () => {
  it("accepts valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(loginSchema.safeParse({}).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com" }).success).toBe(false);
    expect(loginSchema.safeParse({ password: "abc" }).success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  const validInput = {
    currentPassword: "OldPass123!",
    newPassword: "NewPass123!",
    confirmNewPassword: "NewPass123!",
  };

  it("accepts valid password change input", () => {
    const result = changePasswordSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects empty current password", () => {
    const result = changePasswordSchema.safeParse({
      ...validInput,
      currentPassword: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = changePasswordSchema.safeParse({
      ...validInput,
      newPassword: "Ab1!",
      confirmNewPassword: "Ab1!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase letter", () => {
    const result = changePasswordSchema.safeParse({
      ...validInput,
      newPassword: "newpass123!",
      confirmNewPassword: "newpass123!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without lowercase letter", () => {
    const result = changePasswordSchema.safeParse({
      ...validInput,
      newPassword: "NEWPASS123!",
      confirmNewPassword: "NEWPASS123!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without a digit", () => {
    const result = changePasswordSchema.safeParse({
      ...validInput,
      newPassword: "NewPassAbc!",
      confirmNewPassword: "NewPassAbc!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without a special character", () => {
    const result = changePasswordSchema.safeParse({
      ...validInput,
      newPassword: "NewPass123",
      confirmNewPassword: "NewPass123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched confirmation password", () => {
    const result = changePasswordSchema.safeParse({
      ...validInput,
      confirmNewPassword: "DifferentPass123!",
    });
    expect(result.success).toBe(false);
  });
});
