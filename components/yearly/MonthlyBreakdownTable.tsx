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
    <Card className="gap-0 py-0">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[200px]">{t("month")}</TableHead>
              <TableHead className="text-right">{t("collected")}</TableHead>
              <TableHead className="text-right">{t("donated")}</TableHead>
              <TableHead className="text-right">{t("balance")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const balance =
                Number(record.collectedAmount) - Number(record.donatedAmount);
              return (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.month}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(record.collectedAmount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(record.donatedAmount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(balance.toString())}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-bold">{t("annualTotal")}</TableCell>
              <TableCell className="text-right font-bold tabular-nums">
                {formatAmount(totalCollected)}
              </TableCell>
              <TableCell className="text-right font-bold tabular-nums">
                {formatAmount(totalDonated)}
              </TableCell>
              <TableCell className="text-right font-bold tabular-nums">
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
