"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TrashTable, type TrashColumn } from "./TrashTable";
import { TrashActionBar } from "./TrashActionBar";
import { PurgeConfirmDialog } from "./PurgeConfirmDialog";
import { useTrashActions } from "@/features/trash/use-trash-actions";
import { searchAtom, pageAtom, PAGE_SIZE } from "@/features/trash/atoms";
import type {
  TrashResourceType,
  DeletedUser,
  DeletedDonationPlace,
  DeletedSupporterDonation,
  DeletedDistributionRecord,
} from "@/features/trash/types";

type TrashTabContentProps = {
  type: TrashResourceType;
  isActive: boolean;
  canPurge: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMonth(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getUserColumns(): TrashColumn<DeletedUser>[] {
  return [
    { key: "name", labelKey: "name", render: (u) => u.name ?? "-" },
    { key: "email", labelKey: "email", render: (u) => u.email },
    { key: "role", labelKey: "role", render: (u) => u.role },
    { key: "deletedAt", labelKey: "deletedAt", render: (u) => formatDate(u.deletedAt) },
  ];
}

function getDonationPlaceColumns(): TrashColumn<DeletedDonationPlace>[] {
  return [
    { key: "name", labelKey: "name", render: (p) => p.name },
    { key: "note", labelKey: "note", render: (p) => p.note ?? "-" },
    { key: "status", labelKey: "status", render: (p) => (p.isActive ? "Active" : "Inactive") },
    { key: "deletedAt", labelKey: "deletedAt", render: (p) => formatDate(p.deletedAt) },
  ];
}

function getSupporterDonationColumns(): TrashColumn<DeletedSupporterDonation>[] {
  return [
    { key: "name", labelKey: "name", render: (s) => s.name },
    { key: "amount", labelKey: "amount", render: (s) => `${s.amount} ${s.currency}` },
    { key: "kyatAmount", labelKey: "kyatAmount", render: (s) => Number(s.kyatAmount).toLocaleString() },
    { key: "month", labelKey: "month", render: (s) => formatMonth(s.monthlyOverview.year, s.monthlyOverview.month) },
    { key: "deletedAt", labelKey: "deletedAt", render: (s) => formatDate(s.deletedAt) },
  ];
}

function getDistributionRecordColumns(): TrashColumn<DeletedDistributionRecord>[] {
  return [
    { key: "recipient", labelKey: "recipient", render: (d) => d.recipient },
    { key: "amountMmk", labelKey: "amountMmk", render: (d) => Number(d.amountMMK).toLocaleString() },
    { key: "place", labelKey: "place", render: (d) => d.donationPlace?.name ?? "-" },
    { key: "month", labelKey: "month", render: (d) => formatMonth(d.monthlyOverview.year, d.monthlyOverview.month) },
    { key: "deletedAt", labelKey: "deletedAt", render: (d) => formatDate(d.deletedAt) },
  ];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getColumns(type: TrashResourceType): TrashColumn<any>[] {
  switch (type) {
    case "users":
      return getUserColumns();
    case "donation-places":
      return getDonationPlaceColumns();
    case "supporter-donations":
      return getSupporterDonationColumns();
    case "distribution-records":
      return getDistributionRecordColumns();
  }
}

function filterItems<T extends Record<string, unknown>>(items: T[], query: string): T[] {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter((item) =>
    Object.values(item).some(
      (v) => typeof v === "string" && v.toLowerCase().includes(q),
    ),
  );
}

export function TrashTabContent({ type, isActive, canPurge }: TrashTabContentProps) {
  const t = useTranslations("trash");
  const tc = useTranslations("common");
  const [search, setSearch] = useAtom(searchAtom);
  const [page, setPage] = useAtom(pageAtom);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);

  const { restore, purge, isRestoring, isPurging } = useTrashActions();

  // Reset selection and pagination when tab changes
  useEffect(() => {
    setSelectedIds(new Set());
    setSearch("");
    setPage(1);
  }, [type, setSearch, setPage]);

  const { data: items = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["trash", type],
    queryFn: async () => {
      const res = await fetch(`/api/trash/${type}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isActive,
  });

  const columns = useMemo(() => getColumns(type), [type]);

  const filtered = useMemo(() => filterItems(items, search), [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allOnPage = paginated.map((i) => (i as { id: string }).id);
      const allSelected = allOnPage.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        allOnPage.forEach((id) => next.delete(id));
      } else {
        allOnPage.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [paginated]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  async function handleRestore() {
    const ids = Array.from(selectedIds);
    await restore({ type, ids });
    setSelectedIds(new Set());
  }

  async function handlePurge() {
    const ids = Array.from(selectedIds);
    await purge({ type, ids });
    setSelectedIds(new Set());
    setPurgeDialogOpen(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      {/* Action Bar */}
      <TrashActionBar
        selectedCount={selectedIds.size}
        onRestore={handleRestore}
        onPurge={() => setPurgeDialogOpen(true)}
        onClearSelection={clearSelection}
        isRestoring={isRestoring}
        isPurging={isPurging}
        canPurge={canPurge}
      />

      {/* Table */}
      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          <TrashTable
            items={paginated}
            columns={columns}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
          />
        </CardContent>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
            <p className="text-muted-foreground text-sm">
              {tc("showing", {
                from: (currentPage - 1) * PAGE_SIZE + 1,
                to: Math.min(currentPage * PAGE_SIZE, filtered.length),
                total: filtered.length,
                item: "records",
              })}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft />
                <span className="sr-only">{tc("previousPage")}</span>
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight />
                <span className="sr-only">{tc("nextPage")}</span>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Purge Confirmation Dialog */}
      <PurgeConfirmDialog
        open={purgeDialogOpen}
        onOpenChange={setPurgeDialogOpen}
        count={selectedIds.size}
        onConfirm={handlePurge}
      />
    </div>
  );
}
