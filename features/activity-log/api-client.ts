import type { ActivityLogPage, ActivityLogSummary } from "./types";

export async function fetchActivityLogs(params: Record<string, string>): Promise<ActivityLogPage> {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "")),
  ).toString();

  const res = await fetch(`/api/activity-logs?${query}`);
  if (!res.ok) throw new Error("Failed to fetch activity logs");
  return res.json();
}

export async function fetchActivityLogSummary(): Promise<ActivityLogSummary> {
  const res = await fetch("/api/activity-logs/summary");
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function exportActivityLogsCsv(params: Record<string, string>) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "")),
  ).toString();

  const res = await fetch(`/api/activity-logs/export?${query}`);
  if (!res.ok) throw new Error("Failed to export logs");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
