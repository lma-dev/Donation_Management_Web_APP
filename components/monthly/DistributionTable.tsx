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
import type { DistributionRecordResponse } from "@/features/monthly-overview/types";

type DistributionTableProps = {
  distributions: DistributionRecordResponse[];
  totalDonated: string;
  onAddClick: () => void;
};

function formatAmount(value: string): string {
  return new Intl.NumberFormat("en-US").format(Number(value));
}

export function DistributionTable({
  distributions,
  totalDonated,
  onAddClick,
}: DistributionTableProps) {
  const t = useTranslations("monthlyOverview.distribution");
  const tc = useTranslations("common");

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <Button size="sm" onClick={onAddClick} className="gap-1 rounded-lg px-4">
          <Plus className="size-4" />
          {t("addEntry")}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-50">{t("place")}</TableHead>
              <TableHead className="text-right">{t("amountMmk")}</TableHead>
              <TableHead>{t("remarks")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {distributions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-muted-foreground text-center"
                >
                  {t("empty")}
                </TableCell>
              </TableRow>
            ) : (
              distributions.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.recipient}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(d.amountMMK)}
                  </TableCell>
                  <TableCell
                    className="text-muted-foreground max-w-50 truncate"
                    title={d.remarks ?? undefined}
                  >
                    {d.remarks ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {distributions.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell className="font-semibold">{tc("total")}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatAmount(totalDonated)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </CardContent>
    </Card>
  );
}
