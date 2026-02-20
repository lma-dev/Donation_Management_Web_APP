"use client";

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
import type { SupporterDonationResponse } from "@/features/monthly-overview/types";

type SupporterDonationsTableProps = {
  supporters: SupporterDonationResponse[];
  totalCollected: string;
  onAddClick: () => void;
};

function formatAmount(value: string): string {
  return new Intl.NumberFormat("en-US").format(Number(value));
}

export function SupporterDonationsTable({
  supporters,
  totalCollected,
  onAddClick,
}: SupporterDonationsTableProps) {
  const t = useTranslations("monthlyOverview.supporters");
  const tc = useTranslations("common");

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("title")}</CardTitle>
        <Button size="sm" onClick={onAddClick} className="gap-1">
          <Plus className="size-4" />
          {t("addEntry")}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[200px]">{t("name")}</TableHead>
              <TableHead className="text-right">{t("amount")}</TableHead>
              <TableHead className="text-center">{t("currency")}</TableHead>
              <TableHead className="text-right">{t("kyats")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supporters.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground text-center"
                >
                  {t("empty")}
                </TableCell>
              </TableRow>
            ) : (
              supporters.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(s.amount)}
                  </TableCell>
                  <TableCell className="text-center">{s.currency}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(s.kyatAmount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {supporters.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="font-bold">
                  {tc("total")}
                </TableCell>
                <TableCell className="text-right font-bold tabular-nums">
                  {formatAmount(totalCollected)}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </CardContent>
    </Card>
  );
}
