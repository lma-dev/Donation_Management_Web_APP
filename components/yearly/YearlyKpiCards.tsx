"use client";

import { ArrowDownToLine, ArrowUpFromLine, Wallet } from "lucide-react";
import { KpiCard } from "./KpiCard";

type YearlyKpiCardsProps = {
  totalCollected: string;
  totalDonated: string;
  remainingBalance: string;
};

function formatCurrency(value: string): string {
  return new Intl.NumberFormat("en-US").format(Number(value));
}

export function YearlyKpiCards({
  totalCollected,
  totalDonated,
  remainingBalance,
}: YearlyKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      />
    </div>
  );
}
