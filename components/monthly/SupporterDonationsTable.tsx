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
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Donations from Supporters</CardTitle>
        <Button size="sm" onClick={onAddClick} className="gap-1">
          <Plus className="size-4" />
          Add Entry
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Currency</TableHead>
              <TableHead className="text-right">Kyats (MMK)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supporters.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground text-center"
                >
                  No supporter donations yet
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
                  Total
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
