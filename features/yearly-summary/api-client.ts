import type { YearlySummaryResponse } from "./types";

export async function fetchYearlySummary(
  year: number,
): Promise<YearlySummaryResponse> {
  const res = await fetch(`/api/yearly?year=${year}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to fetch yearly summary");
  }
  return res.json();
}

export async function fetchAvailableYears(): Promise<{ years: number[] }> {
  const res = await fetch("/api/yearly");
  if (!res.ok) {
    throw new Error("Failed to fetch available years");
  }
  return res.json();
}

export async function downloadExport(
  year: number,
  type: "excel" | "pdf" | "json",
) {
  const res = await fetch(`/api/yearly/export?year=${year}&type=${type}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to generate export");
  }

  const blob = await res.blob();
  const contentDisposition = res.headers.get("Content-Disposition");
  const filename =
    contentDisposition?.match(/filename="(.+)"/)?.[1] ??
    `yearly-summary-${year}.${type === "excel" ? "xlsx" : type}`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
