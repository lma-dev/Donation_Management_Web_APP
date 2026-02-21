"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { PageContent } from "@/components/layout/PageContent";
import { PageGuide } from "@/components/layout/PageGuide";
import { MonthSelector } from "@/components/monthly/MonthSelector";
import { MonthlyKpiCards } from "@/components/monthly/MonthlyKpiCards";
import { SupporterDonationsTable } from "@/components/monthly/SupporterDonationsTable";
import { DistributionTable } from "@/components/monthly/DistributionTable";
import { AddSupporterDialog } from "@/components/monthly/AddSupporterDialog";
import { AddDistributionDialog } from "@/components/monthly/AddDistributionDialog";
import { MonthlyExportDropdown } from "@/components/monthly/MonthlyExportDropdown";
import { CreateMonthlyForm } from "@/components/monthly/CreateMonthlyForm";
import { useMonthlyData } from "@/features/monthly-overview/use-monthly-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMonthKey } from "@/lib/constants";

export default function MonthlyOverviewPage() {
  const t = useTranslations("monthlyOverview");
  const tm = useTranslations("months");
  const { data: session } = useSession();
  const canEdit = session?.user?.role === "ADMIN" || session?.user?.role === "SYSTEM_ADMIN";
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    overview,
    isLoading,
    error,
    isNotFound,
    previousBalance,
    handleCreateOverview,
    handleUpdateExchangeRate,
    handleAddSupporter,
    handleAddDistribution,
    handleUpdateSupporter,
    handleDeleteSupporter,
    handleUpdateDistribution,
    handleDeleteDistribution,
    handleExport,
    isExporting,
  } = useMonthlyData();

  const [supporterDialogOpen, setSupporterDialogOpen] = useState(false);
  const [distributionDialogOpen, setDistributionDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [isSavingRate, setIsSavingRate] = useState(false);

  const rateValue = editingRate ?? String(overview?.exchangeRate ?? "");
  const rateChanged =
    editingRate !== null &&
    overview &&
    Number(editingRate) !== overview.exchangeRate &&
    Number(editingRate) > 0;

  async function handleSaveRate() {
    if (!rateChanged) return;
    setIsSavingRate(true);
    try {
      await handleUpdateExchangeRate(Number(editingRate));
      setEditingRate(null);
    } finally {
      setIsSavingRate(false);
    }
  }

  const monthKey = getMonthKey(selectedMonth);
  const monthName = monthKey ? tm(monthKey) : "";

  return (
    <PageContent
      title={t("title")}
      description={t("description", { month: monthName, year: selectedYear })}
      guide={<PageGuide title={t("guide.title")} description={t("guide.description")} />}
      actions={
        <div className="flex items-center gap-2">
          <MonthSelector
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
          />
          {overview && (
            <MonthlyExportDropdown
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
      ) : isNotFound ? (
        canEdit ? (
          <CreateMonthlyForm
            year={selectedYear}
            month={selectedMonth}
            previousBalance={previousBalance}
            onSubmit={handleCreateOverview}
          />
        ) : (
          <div className="text-muted-foreground py-10 text-center">
            {t("noData")}
          </div>
        )
      ) : error ? (
        <div className="text-muted-foreground py-10 text-center">
          {error.message}
        </div>
      ) : overview ? (
        <div className="space-y-6">
          {/* Exchange Rate Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {t("exchangeRate")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground shrink-0 text-sm">
                  {t("jpyEquals")}
                </Label>
                <Input
                  type="number"
                  value={rateValue}
                  onChange={(e) => setEditingRate(e.target.value)}
                  className="w-32"
                />
                <span className="text-muted-foreground text-sm">
                  {t("mmk")}
                </span>
                {rateChanged && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveRate}
                    disabled={isSavingRate}
                  >
                    {isSavingRate ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <span> {t("confirm")}</span>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* KPI Cards */}
          <MonthlyKpiCards
            carryOver={overview.carryOver}
            totalCollected={overview.totalCollected}
            totalDonated={overview.totalDonated}
            remainingBalance={overview.remainingBalance}
          />

          {/* Tables */}
          <div className="grid gap-6 xl:grid-cols-2">
            <SupporterDonationsTable
              supporters={overview.supporters}
              totalCollected={overview.totalCollected}
              exchangeRate={overview.exchangeRate}
              canEdit={canEdit}
              onAddClick={() => setSupporterDialogOpen(true)}
              onSubmit={handleAddSupporter}
              onUpdate={handleUpdateSupporter}
              onDelete={handleDeleteSupporter}
            />
            <DistributionTable
              distributions={overview.distributions}
              totalDonated={overview.totalDonated}
              canEdit={canEdit}
              onAddClick={() => setDistributionDialogOpen(true)}
              onSubmit={handleAddDistribution}
              onUpdate={handleUpdateDistribution}
              onDelete={handleDeleteDistribution}
            />
          </div>

          {/* Dialogs */}
          <AddSupporterDialog
            open={supporterDialogOpen}
            onOpenChange={setSupporterDialogOpen}
            exchangeRate={overview.exchangeRate}
            onSubmit={handleAddSupporter}
          />
          <AddDistributionDialog
            open={distributionDialogOpen}
            onOpenChange={setDistributionDialogOpen}
            onSubmit={handleAddDistribution}
          />
        </div>
      ) : null}
    </PageContent>
  );
}
