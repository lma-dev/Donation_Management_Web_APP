"use client";

import { ArrowDownToLine, ArrowUpFromLine, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("yearlyOverview.kpi");

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        title={t("totalCollected")}
        value={formatCurrency(totalCollected)}
        icon={ArrowDownToLine}
      />
      <KpiCard
        title={t("totalDonated")}
        value={formatCurrency(totalDonated)}
        icon={ArrowUpFromLine}
      />
      <KpiCard
        title={t("remainingBalance")}
        value={formatCurrency(remainingBalance)}
        icon={Wallet}
        highlighted
      />
    </div>
  );
}
