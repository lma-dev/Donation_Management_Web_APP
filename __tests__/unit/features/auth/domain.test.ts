import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthError } from "@/features/auth/error";

// Mock the data layer
vi.mock("@/features/auth/data", () => ({
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  updateFailedAttempts: vi.fn(),
  resetFailedAttempts: vi.fn(),
  updateUserPassword: vi.fn(),
}));

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

import { authenticateUser, changePassword } from "@/features/auth/domain";
import {
  findUserByEmail,
  findUserById,
  updateFailedAttempts,
  resetFailedAttempts,
  updateUserPassword,
} from "@/features/auth/data";
import bcrypt from "bcryptjs";

const mockFindUserByEmail = vi.mocked(findUserByEmail);
const mockFindUserById = vi.mocked(findUserById);
const mockUpdateFailedAttempts = vi.mocked(updateFailedAttempts);
const mockResetFailedAttempts = vi.mocked(resetFailedAttempts);
const mockUpdateUserPassword = vi.mocked(updateUserPassword);
const mockBcryptCompare = vi.mocked(bcrypt.compare);
const mockBcryptHash = vi.mocked(bcrypt.hash);

const mockUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  emailVerified: null,
  image: null,
  password: "$2a$10$hashedpassword",
  role: "USER" as const,
  isLocked: false,
  lockedAt: null,
  failedLoginAttempts: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("authenticateUser", () => {
  it("returns user data on successful authentication", async () => {
    mockFindUserByEmail.mockResolvedValue(mockUser);
    mockBcryptCompare.mockResolvedValue(true as never);

    const result = await authenticateUser("test@example.com", "password123");

    expect(result).toEqual({
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
    });
  });

  it("resets failed attempts on success when count > 0", async () => {
    mockFindUserByEmail.mockResolvedValue({
      ...mockUser,
      failedLoginAttempts: 3,
    });
    mockBcryptCompare.mockResolvedValue(true as never);

    await authenticateUser("test@example.com", "password123");

    expect(mockResetFailedAttempts).toHaveBeenCalledWith("user-1");
  });

  it("does not reset failed attempts when count is 0", async () => {
    mockFindUserByEmail.mockResolvedValue(mockUser);
    mockBcryptCompare.mockResolvedValue(true as never);

    await authenticateUser("test@example.com", "password123");

    expect(mockResetFailedAttempts).not.toHaveBeenCalled();
  });

  it("throws USER_NOT_FOUND when user does not exist", async () => {
    mockFindUserByEmail.mockResolvedValue(null);

    await expect(
      authenticateUser("unknown@example.com", "password123"),
    ).rejects.toThrow(AuthError);

    try {
      await authenticateUser("unknown@example.com", "password123");
    } catch (e) {
      expect(e).toBeInstanceOf(AuthError);
      expect((e as AuthError).code).toBe("USER_NOT_FOUND");
    }
  });

  it("throws USER_NOT_FOUND when user has no password", async () => {
    mockFindUserByEmail.mockResolvedValue({ ...mockUser, password: null });

    await expect(
      authenticateUser("test@example.com", "password123"),
    ).rejects.toThrow(AuthError);
  });

  it("throws ACCOUNT_LOCKED when account is locked", async () => {
    mockFindUserByEmail.mockResolvedValue({
      ...mockUser,
      isLocked: true,
    });

    try {
      await authenticateUser("test@example.com", "password123");
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(AuthError);
      expect((e as AuthError).code).toBe("ACCOUNT_LOCKED");
    }
  });

  it("increments failed attempts on wrong password", async () => {
    mockFindUserByEmail.mockResolvedValue(mockUser);
    mockBcryptCompare.mockResolvedValue(false as never);

    try {
      await authenticateUser("test@example.com", "wrongpassword");
    } catch {
      // expected
    }

    expect(mockUpdateFailedAttempts).toHaveBeenCalledWith("user-1", 1, false);
  });

  it("throws INVALID_CREDENTIALS on wrong password (< 5 attempts)", async () => {
    mockFindUserByEmail.mockResolvedValue({
      ...mockUser,
      failedLoginAttempts: 2,
    });
    mockBcryptCompare.mockResolvedValue(false as never);

    try {
      await authenticateUser("test@example.com", "wrongpassword");
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(AuthError);
      expect((e as AuthError).code).toBe("INVALID_CREDENTIALS");
    }
  });

  it("locks account on 5th failed attempt", async () => {
    mockFindUserByEmail.mockResolvedValue({
      ...mockUser,
      failedLoginAttempts: 4, // this will be the 5th attempt
    });
    mockBcryptCompare.mockResolvedValue(false as never);

    try {
      await authenticateUser("test@example.com", "wrongpassword");
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(AuthError);
      expect((e as AuthError).code).toBe("ACCOUNT_LOCKED");
    }

    expect(mockUpdateFailedAttempts).toHaveBeenCalledWith("user-1", 5, true);
  });
});

describe("changePassword", () => {
  beforeEach(() => {
    mockFindUserById.mockResolvedValue(mockUser);
  });

  it("successfully changes password", async () => {
    mockBcryptCompare.mockResolvedValue(true as never);
    mockBcryptHash.mockResolvedValue("$2a$10$newhash" as never);

    await changePassword("user-1", "OldPass123!", "NewPass123!", "NewPass123!");

    expect(mockBcryptHash).toHaveBeenCalledWith("NewPass123!", 10);
    expect(mockUpdateUserPassword).toHaveBeenCalledWith(
      "user-1",
      "$2a$10$newhash",
    );
  });

  it("throws WRONG_PASSWORD when current password is incorrect", async () => {
    mockBcryptCompare.mockResolvedValue(false as never);

    try {
      await changePassword(
        "user-1",
        "WrongOld123!",
        "NewPass123!",
        "NewPass123!",
      );
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(AuthError);
      expect((e as AuthError).code).toBe("WRONG_PASSWORD");
    }
  });

  it("throws USER_NOT_FOUND when user does not exist", async () => {
    mockFindUserById.mockResolvedValue(null);

    try {
      await changePassword(
        "missing-id",
        "OldPass123!",
        "NewPass123!",
        "NewPass123!",
      );
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(AuthError);
      expect((e as AuthError).code).toBe("USER_NOT_FOUND");
    }
  });

  it("throws VALIDATION_ERROR for weak new password", async () => {
    try {
      await changePassword("user-1", "OldPass123!", "weak", "weak");
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(AuthError);
      expect((e as AuthError).code).toBe("VALIDATION_ERROR");
    }
  });

  it("throws VALIDATION_ERROR when passwords do not match", async () => {
    try {
      await changePassword(
        "user-1",
        "OldPass123!",
        "NewPass123!",
        "DifferentPass123!",
      );
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(AuthError);
      expect((e as AuthError).code).toBe("VALIDATION_ERROR");
    }
  });
});
