"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageContent } from "@/components/layout/PageContent";
import { PageGuide } from "@/components/layout/PageGuide";
import { DonationPlaceSearch } from "@/components/donation-place/DonationPlaceSearch";
import { DonationPlaceTable } from "@/components/donation-place/DonationPlaceTable";
import { DonationPlaceForm } from "@/components/donation-place/DonationPlaceForm";
import { DeleteDonationPlaceDialog } from "@/components/donation-place/DeleteDonationPlaceDialog";
import {
  searchAtom,
  pageAtom,
  PAGE_SIZE,
} from "@/features/donation-place/atoms";
import {
  useDonationPlaceActions,
  type DonationPlaceFormData,
} from "@/features/donation-place/use-donation-place-actions";
import type { DonationPlace } from "@/features/donation-place/types";

export default function DonationPlaceManagementPage() {
  const t = useTranslations("donationPlaces");
  const tc = useTranslations("common");
  const { data: places = [], isLoading } = useQuery<DonationPlace[]>({
    queryKey: ["donation-places"],
    queryFn: async () => {
      const res = await fetch("/api/donation-places");
      if (!res.ok) throw new Error("Failed to fetch donation places");
      const data = await res.json();
      return data.map((p: Record<string, unknown>) => ({
        ...p,
        createdAt: new Date(p.createdAt as string),
        updatedAt: new Date(p.updatedAt as string),
      }));
    },
  });

  const [search, setSearch] = useAtom(searchAtom);
  const [page, setPage] = useAtom(pageAtom);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return places;
    return places.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.note && p.note.toLowerCase().includes(q)),
    );
  }, [places, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const { addPlace, updatePlace, deletePlace } = useDonationPlaceActions();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<DonationPlace | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingPlace, setDeletingPlace] = useState<DonationPlace | null>(
    null,
  );

  function handleAdd() {
    setEditingPlace(null);
    setFormOpen(true);
  }

  function handleEdit(place: DonationPlace) {
    setEditingPlace(place);
    setFormOpen(true);
  }

  function handleDeleteRequest(place: DonationPlace) {
    setDeletingPlace(place);
    setDeleteOpen(true);
  }

  async function handleFormSubmit(data: DonationPlaceFormData) {
    if (editingPlace) {
      await updatePlace(editingPlace.id, data);
    } else {
      await addPlace(data);
    }
    setFormOpen(false);
  }

  async function handleDeleteConfirm() {
    if (deletingPlace) {
      await deletePlace(deletingPlace.id);
    }
    setDeleteOpen(false);
    setDeletingPlace(null);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  return (
    <PageContent
      title={t("title")}
      description={t("description")}
      guide={<PageGuide title={t("guide.title")} description={t("guide.description")} />}
      actions={
        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <Plus />
          {t("addPlace")}
        </Button>
      }
    >
      <DonationPlaceSearch value={search} onChange={setSearch} />

      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          <DonationPlaceTable
            places={paginated}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        </CardContent>

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
            <p className="text-muted-foreground text-sm">
              {tc("showing", {
                from: (currentPage - 1) * PAGE_SIZE + 1,
                to: Math.min(currentPage * PAGE_SIZE, filtered.length),
                total: filtered.length,
                item: "places",
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

      <DonationPlaceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        place={editingPlace}
        onSubmit={handleFormSubmit}
      />

      <DeleteDonationPlaceDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        place={deletingPlace}
        onConfirm={handleDeleteConfirm}
      />
    </PageContent>
  );
}
