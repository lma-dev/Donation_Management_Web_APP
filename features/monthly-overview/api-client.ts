import type { MonthlyOverviewResponse } from "./types";

export async function fetchMonthlyOverview(
  year: number,
  month: number,
): Promise<MonthlyOverviewResponse> {
  const res = await fetch(`/api/monthly?year=${year}&month=${month}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to fetch monthly overview");
  }
  return res.json();
}

export async function fetchPreviousMonthBalance(
  year: number,
  month: number,
): Promise<string> {
  const res = await fetch(
    `/api/monthly/previous-balance?year=${year}&month=${month}`,
  );
  if (!res.ok) return "0";
  const data = await res.json();
  return data.balance ?? "0";
}

export async function createMonthlyOverview(data: {
  year: number;
  month: number;
  exchangeRate: number;
  carryOver: number;
}) {
  const res = await fetch("/api/monthly", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create monthly overview");
  }
  return res.json();
}

export async function updateExchangeRate(data: {
  id: string;
  exchangeRate: number;
}) {
  const res = await fetch("/api/monthly", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update exchange rate");
  }
  return res.json();
}

export async function createSupporterDonation(data: {
  monthlyOverviewId: string;
  name: string;
  amount: number;
  currency: string;
  kyatAmount: number;
}) {
  const res = await fetch("/api/monthly/supporter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create supporter donation");
  }
  return res.json();
}

export async function createDistributionRecord(data: {
  monthlyOverviewId: string;
  donationPlaceId: string;
  recipient: string;
  amountMMK: number;
  remarks?: string;
}) {
  const res = await fetch("/api/monthly/distribution", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to create distribution record");
  }
  return res.json();
}

export async function updateSupporterDonation(data: {
  id: string;
  name: string;
  amount: number;
  currency: string;
  kyatAmount: number;
}) {
  const res = await fetch("/api/monthly/supporter", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update supporter donation");
  }
  return res.json();
}

export async function deleteSupporterDonation(id: string) {
  const res = await fetch(`/api/monthly/supporter?id=${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to delete supporter donation");
  }
  return res.json();
}

export async function updateDistributionRecord(data: {
  id: string;
  donationPlaceId: string;
  recipient: string;
  amountMMK: number;
  remarks?: string;
}) {
  const res = await fetch("/api/monthly/distribution", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to update distribution record");
  }
  return res.json();
}

export async function deleteDistributionRecord(id: string) {
  const res = await fetch(`/api/monthly/distribution?id=${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to delete distribution record");
  }
  return res.json();
}

export async function downloadMonthlyExport(
  year: number,
  month: number,
  type: "excel" | "pdf" | "json",
) {
  const res = await fetch(
    `/api/monthly/export?year=${year}&month=${month}&type=${type}`,
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to generate export");
  }

  const blob = await res.blob();
  const contentDisposition = res.headers.get("Content-Disposition");
  const filename =
    contentDisposition?.match(/filename="(.+)"/)?.[1] ??
    `monthly-overview-${year}-${month}.${type === "excel" ? "xlsx" : type}`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
