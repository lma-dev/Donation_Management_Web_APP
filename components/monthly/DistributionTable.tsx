"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RowActionMenu } from "./RowActionMenu";
import { AddDistributionDialog } from "./AddDistributionDialog";
import { DeleteRecordDialog } from "./DeleteRecordDialog";
import type { DistributionRecordResponse } from "@/features/monthly-overview/types";

type DistributionTableProps = {
  distributions: DistributionRecordResponse[];
  totalDonated: string;
  canEdit?: boolean;
  onAddClick: () => void;
  onSubmit: (data: {
    recipient: string;
    donationPlaceId: string;
    amountMMK: number;
    remarks?: string;
  }) => Promise<void>;
  onUpdate: (data: {
    id: string;
    recipient: string;
    donationPlaceId: string;
    amountMMK: number;
    remarks?: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function formatAmount(value: string): string {
  return new Intl.NumberFormat("en-US").format(Number(value));
}

export function DistributionTable({
  distributions,
  totalDonated,
  canEdit = true,
  onAddClick,
  onSubmit,
  onUpdate,
  onDelete,
}: DistributionTableProps) {
  const t = useTranslations("monthlyOverview.distribution");
  const tc = useTranslations("common");

  const [editingItem, setEditingItem] = useState<DistributionRecordResponse | null>(null);
  const [deletingItem, setDeletingItem] = useState<DistributionRecordResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await onDelete(deletingItem.id);
      setDeletingItem(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Card className="gap-0 overflow-hidden rounded-2xl py-0 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-base">{t("title")}</CardTitle>
          {canEdit && (
            <Button size="sm" onClick={onAddClick} className="gap-1 rounded-lg px-4">
              <Plus className="size-4" />
              {t("addEntry")}
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-muted-foreground w-32 sm:w-50 px-3 py-2.5 sm:px-6 sm:py-3.5 text-[13px] font-semibold uppercase tracking-wide">
                  {t("place")}
                </TableHead>
                <TableHead className="text-muted-foreground px-3 py-2.5 sm:px-6 sm:py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide">
                  {t("amountMmk")}
                </TableHead>
                <TableHead className="text-muted-foreground hidden sm:table-cell px-3 py-2.5 sm:px-6 sm:py-3.5 text-[13px] font-semibold uppercase tracking-wide">
                  {t("remarks")}
                </TableHead>
                {canEdit && <TableHead className="w-15" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canEdit ? 4 : 3}
                    className="text-muted-foreground px-3 py-2.5 sm:px-6 sm:py-3.5 text-center"
                  >
                    {t("empty")}
                  </TableCell>
                </TableRow>
              ) : (
                distributions.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="px-3 py-2.5 sm:px-6 sm:py-3.5 font-medium">{d.recipient}</TableCell>
                    <TableCell className="px-3 py-2.5 sm:px-6 sm:py-3.5 text-right tabular-nums">
                      {formatAmount(d.amountMMK)}
                    </TableCell>
                    <TableCell
                      className="text-muted-foreground hidden sm:table-cell max-w-24 sm:max-w-50 truncate px-3 py-2.5 sm:px-6 sm:py-3.5"
                      title={d.remarks ?? undefined}
                    >
                      {d.remarks ?? "—"}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <RowActionMenu
                          onEdit={() => setEditingItem(d)}
                          onDelete={() => setDeletingItem(d)}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
            {distributions.length > 0 && (
              <TableFooter className="border-t-2">
                <TableRow className="hover:bg-transparent">
                  <TableCell className="px-3 py-2.5 sm:px-6 sm:py-3.5 font-bold">{tc("total")}</TableCell>
                  <TableCell className="px-3 py-2.5 sm:px-6 sm:py-3.5 text-right font-bold tabular-nums">
                    {formatAmount(totalDonated)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell" />
                  {canEdit && <TableCell />}
                </TableRow>
              </TableFooter>
            )}
          </Table>
          </div>
        </CardContent>
      </Card>

      <AddDistributionDialog
        open={!!editingItem}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null);
        }}
        editData={editingItem}
        onSubmit={onSubmit}
        onUpdate={onUpdate}
      />

      <DeleteRecordDialog
        open={!!deletingItem}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
