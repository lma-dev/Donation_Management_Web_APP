import type { DashboardResponse } from "./types";

export async function fetchDashboardData(): Promise<DashboardResponse> {
  const res = await fetch("/api/dashboard");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to fetch dashboard data");
  }
  return res.json();
}
