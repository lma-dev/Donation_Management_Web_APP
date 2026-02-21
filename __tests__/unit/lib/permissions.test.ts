import { describe, it, expect } from "vitest";
import { hasMinRole, ROUTE_PERMISSIONS } from "@/lib/permissions";

describe("hasMinRole", () => {
  it("USER meets USER requirement", () => {
    expect(hasMinRole("USER", "USER")).toBe(true);
  });

  it("ADMIN meets USER requirement", () => {
    expect(hasMinRole("ADMIN", "USER")).toBe(true);
  });

  it("ADMIN meets ADMIN requirement", () => {
    expect(hasMinRole("ADMIN", "ADMIN")).toBe(true);
  });

  it("SYSTEM_ADMIN meets all requirements", () => {
    expect(hasMinRole("SYSTEM_ADMIN", "USER")).toBe(true);
    expect(hasMinRole("SYSTEM_ADMIN", "ADMIN")).toBe(true);
    expect(hasMinRole("SYSTEM_ADMIN", "SYSTEM_ADMIN")).toBe(true);
  });

  it("USER does not meet ADMIN requirement", () => {
    expect(hasMinRole("USER", "ADMIN")).toBe(false);
  });

  it("USER does not meet SYSTEM_ADMIN requirement", () => {
    expect(hasMinRole("USER", "SYSTEM_ADMIN")).toBe(false);
  });

  it("ADMIN does not meet SYSTEM_ADMIN requirement", () => {
    expect(hasMinRole("ADMIN", "SYSTEM_ADMIN")).toBe(false);
  });

  it("unknown user role defaults to level 0", () => {
    expect(hasMinRole("UNKNOWN", "USER")).toBe(true);
    expect(hasMinRole("UNKNOWN", "ADMIN")).toBe(false);
  });

  it("unknown required role defaults to level 999 (denies access)", () => {
    expect(hasMinRole("SYSTEM_ADMIN", "UNKNOWN")).toBe(false);
  });
});

describe("ROUTE_PERMISSIONS", () => {
  it("activity-logs requires SYSTEM_ADMIN", () => {
    const rule = ROUTE_PERMISSIONS.find((r) => r.path === "/activity-logs");
    expect(rule).toBeDefined();
    expect(rule!.minRole).toBe("SYSTEM_ADMIN");
  });

  it("user-management requires ADMIN", () => {
    const rule = ROUTE_PERMISSIONS.find((r) => r.path === "/user-management");
    expect(rule).toBeDefined();
    expect(rule!.minRole).toBe("ADMIN");
  });

  it("donation-place-management requires ADMIN", () => {
    const rule = ROUTE_PERMISSIONS.find(
      (r) => r.path === "/donation-place-management",
    );
    expect(rule).toBeDefined();
    expect(rule!.minRole).toBe("ADMIN");
  });
});
