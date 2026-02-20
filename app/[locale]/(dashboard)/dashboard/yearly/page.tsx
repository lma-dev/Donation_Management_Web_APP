"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { PageContent } from "@/components/layout/PageContent";
import { YearlyKpiCards } from "@/components/yearly/YearlyKpiCards";
import { MonthlyBreakdownTable } from "@/components/yearly/MonthlyBreakdownTable";
import { YearSelector } from "@/components/yearly/YearSelector";
import { ExportDropdown } from "@/components/yearly/ExportDropdown";
import { useYearlyData } from "@/features/yearly-summary/use-yearly-data";

export default function YearlyOverviewPage() {
  const t = useTranslations("yearlyOverview");
  const {
    selectedYear,
    setSelectedYear,
    summary,
    isLoading,
    error,
    availableYears,
    handleExport,
    isExporting,
  } = useYearlyData();

  return (
    <PageContent
      title={t("title")}
      description={t("description", { year: selectedYear })}
      actions={
        <div className="flex items-center gap-2">
          <YearSelector
            selectedYear={selectedYear}
            availableYears={availableYears}
            onYearChange={setSelectedYear}
          />
          {summary && (
            <ExportDropdown
              onExport={handleExport}
              isExporting={isExporting}
            />
          )}
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-muted-foreground py-10 text-center">
          {error.message}
        </div>
      ) : summary ? (
        <div className="space-y-6">
          <YearlyKpiCards
            totalCollected={summary.totalCollected}
            totalDonated={summary.totalDonated}
            remainingBalance={summary.remainingBalance}
          />
          <MonthlyBreakdownTable
            records={summary.monthlyRecords}
            totalCollected={summary.totalCollected}
            totalDonated={summary.totalDonated}
          />
        </div>
      ) : (
        <div className="text-muted-foreground py-10 text-center">
          {t("empty")}
        </div>
      )}
    </PageContent>
  );
}
