"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  CalendarArrowDown,
} from "lucide-react";
import { KpiCard } from "@/components/yearly/KpiCard";

type MonthlyKpiCardsProps = {
  carryOver: string;
  totalCollected: string;
  totalDonated: string;
  remainingBalance: string;
};

function formatCurrency(value: string): string {
  return new Intl.NumberFormat("en-US").format(Number(value));
}

export function MonthlyKpiCards({
  carryOver,
  totalCollected,
  totalDonated,
  remainingBalance,
}: MonthlyKpiCardsProps) {
  const balance = Number(remainingBalance);
  const isNegative = balance < 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Carry Over"
        value={formatCurrency(carryOver)}
        icon={CalendarArrowDown}
      />
      <KpiCard
        title="Total Collected"
        value={formatCurrency(totalCollected)}
        icon={ArrowDownToLine}
      />
      <KpiCard
        title="Total Donated"
        value={formatCurrency(totalDonated)}
        icon={ArrowUpFromLine}
      />
      <KpiCard
        title="Remaining Balance"
        value={formatCurrency(remainingBalance)}
        icon={Wallet}
        highlighted
        className={isNegative ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}
      />
    </div>
  );
}
