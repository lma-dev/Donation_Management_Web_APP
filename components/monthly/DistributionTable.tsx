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
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Donation Distribution</CardTitle>
        <Button size="sm" onClick={onAddClick} className="gap-1">
          <Plus className="size-4" />
          Add Entry
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[200px]">Recipient</TableHead>
              <TableHead className="text-right">Amount (MMK)</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {distributions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-muted-foreground text-center"
                >
                  No distribution records yet
                </TableCell>
              </TableRow>
            ) : (
              distributions.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.recipient}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatAmount(d.amountMMK)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {d.remarks ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {distributions.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold tabular-nums">
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
