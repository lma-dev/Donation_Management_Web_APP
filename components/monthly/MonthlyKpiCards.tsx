"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("monthlyOverview.kpi");
  const balance = Number(remainingBalance);
  const isNegative = balance < 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title={t("carryOver")}
        value={formatCurrency(carryOver)}
        icon={CalendarArrowDown}
      />
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
        className={isNegative ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}
      />
    </div>
  );
}
