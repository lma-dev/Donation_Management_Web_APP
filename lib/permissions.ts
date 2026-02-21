import type { UserRole } from "@/types/user";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  USER: 0,
  ADMIN: 1,
  SYSTEM_ADMIN: 2,
};

export function hasMinRole(
  userRole: UserRole | string,
  requiredRole: UserRole | string,
): boolean {
  return (
    (ROLE_HIERARCHY[userRole as UserRole] ?? 0) >=
    (ROLE_HIERARCHY[requiredRole as UserRole] ?? 999)
  );
}

export const ROUTE_PERMISSIONS: { path: string; minRole: UserRole }[] = [
  { path: "/activity-logs", minRole: "SYSTEM_ADMIN" },
  { path: "/user-management", minRole: "ADMIN" },
  { path: "/donation-place-management", minRole: "ADMIN" },
];
