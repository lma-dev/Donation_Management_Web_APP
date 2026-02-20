"use client";

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
import { useTranslations } from "next-intl";
import type { MonthlyRecordResponse } from "@/features/yearly-summary/types";

type MonthlyBreakdownTableProps = {
  records: MonthlyRecordResponse[];
  totalCollected: string;
  totalDonated: string;
};

function formatAmount(value: string): string {
  return new Intl.NumberFormat("en-US").format(Number(value));
}

export function MonthlyBreakdownTable({
  records,
  totalCollected,
  totalDonated,
}: MonthlyBreakdownTableProps) {
  const t = useTranslations("yearlyOverview.breakdown");

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl py-0 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-base">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-muted-foreground w-50 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-wide">
                {t("month")}
              </TableHead>
              <TableHead className="text-muted-foreground px-6 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide">
                {t("collected")}
              </TableHead>
              <TableHead className="text-muted-foreground px-6 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide">
                {t("donated")}
              </TableHead>
              <TableHead className="text-muted-foreground px-6 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide">
                {t("balance")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const balance =
                Number(record.collectedAmount) - Number(record.donatedAmount);
              return (
                <TableRow key={record.id}>
                  <TableCell className="px-6 py-3.5 font-medium">
                    {record.month}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-right tabular-nums">
                    {formatAmount(record.collectedAmount)}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-right tabular-nums">
                    {formatAmount(record.donatedAmount)}
                  </TableCell>
                  <TableCell className="px-6 py-3.5 text-right font-semibold tabular-nums text-blue-600">
                    {formatAmount(balance.toString())}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter className="border-t-2">
            <TableRow className="hover:bg-transparent">
              <TableCell className="px-6 py-3.5 font-bold">
                {t("annualTotal")}
              </TableCell>
              <TableCell className="px-6 py-3.5 text-right font-bold tabular-nums">
                {formatAmount(totalCollected)}
              </TableCell>
              <TableCell className="px-6 py-3.5 text-right font-bold tabular-nums">
                {formatAmount(totalDonated)}
              </TableCell>
              <TableCell className="px-6 py-3.5 text-right font-bold tabular-nums text-blue-600">
                {formatAmount(
                  (
                    Number(totalCollected) - Number(totalDonated)
                  ).toString(),
                )}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
