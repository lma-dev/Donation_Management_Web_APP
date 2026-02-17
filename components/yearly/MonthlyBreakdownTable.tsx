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
  return (
    <Card className="gap-0 py-0">
      <CardHeader>
        <CardTitle>Monthly Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[200px]">Month</TableHead>
              <TableHead className="text-right">Collected</TableHead>
              <TableHead className="text-right">Donated</TableHead>
              <TableHead className="text-right">Balance</TableHead>
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
              <TableCell className="font-bold">Annual Total</TableCell>
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
