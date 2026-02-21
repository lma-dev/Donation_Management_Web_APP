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
import { AddSupporterDialog } from "./AddSupporterDialog";
import { DeleteRecordDialog } from "./DeleteRecordDialog";
import type { SupporterDonationResponse } from "@/features/monthly-overview/types";

type SupporterDonationsTableProps = {
  supporters: SupporterDonationResponse[];
  totalCollected: string;
  exchangeRate: number;
  canEdit?: boolean;
  onAddClick: () => void;
  onSubmit: (data: {
    name: string;
    amount: number;
    currency: string;
    kyatAmount: number;
  }) => Promise<void>;
  onUpdate: (data: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    kyatAmount: number;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function formatAmount(value: string): string {
  return new Intl.NumberFormat("en-US").format(Number(value));
}

export function SupporterDonationsTable({
  supporters,
  totalCollected,
  exchangeRate,
  canEdit = true,
  onAddClick,
  onSubmit,
  onUpdate,
  onDelete,
}: SupporterDonationsTableProps) {
  const t = useTranslations("monthlyOverview.supporters");
  const tc = useTranslations("common");

  const [editingItem, setEditingItem] = useState<SupporterDonationResponse | null>(null);
  const [deletingItem, setDeletingItem] = useState<SupporterDonationResponse | null>(null);
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
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-muted-foreground w-50 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-wide">
                  {t("name")}
                </TableHead>
                <TableHead className="text-muted-foreground px-6 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide">
                  {t("amount")}
                </TableHead>
                <TableHead className="text-muted-foreground px-6 py-3.5 text-center text-[13px] font-semibold uppercase tracking-wide">
                  {t("currency")}
                </TableHead>
                <TableHead className="text-muted-foreground px-6 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide">
                  {t("kyats")}
                </TableHead>
                {canEdit && <TableHead className="w-15" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {supporters.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canEdit ? 5 : 4}
                    className="text-muted-foreground px-6 py-3.5 text-center"
                  >
                    {t("empty")}
                  </TableCell>
                </TableRow>
              ) : (
                supporters.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="px-6 py-3.5 font-medium">{s.name}</TableCell>
                    <TableCell className="px-6 py-3.5 text-right tabular-nums">
                      {formatAmount(s.amount)}
                    </TableCell>
                    <TableCell className="px-6 py-3.5 text-center">{s.currency}</TableCell>
                    <TableCell className="px-6 py-3.5 text-right tabular-nums">
                      {formatAmount(s.kyatAmount)}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <RowActionMenu
                          onEdit={() => setEditingItem(s)}
                          onDelete={() => setDeletingItem(s)}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
            {supporters.length > 0 && (
              <TableFooter className="border-t-2">
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={3} className="px-6 py-3.5 font-bold">
                    {tc("total")}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-right font-bold tabular-nums">
                    {formatAmount(totalCollected)}
                  </TableCell>
                  {canEdit && <TableCell />}
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>

      <AddSupporterDialog
        open={!!editingItem}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null);
        }}
        exchangeRate={exchangeRate}
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
