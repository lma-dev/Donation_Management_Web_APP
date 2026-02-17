"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PageContent } from "@/components/layout/PageContent";
import { MonthSelector } from "@/components/monthly/MonthSelector";
import { MonthlyKpiCards } from "@/components/monthly/MonthlyKpiCards";
import { SupporterDonationsTable } from "@/components/monthly/SupporterDonationsTable";
import { DistributionTable } from "@/components/monthly/DistributionTable";
import { AddSupporterDialog } from "@/components/monthly/AddSupporterDialog";
import { AddDistributionDialog } from "@/components/monthly/AddDistributionDialog";
import { MonthlyExportDropdown } from "@/components/monthly/MonthlyExportDropdown";
import { CreateMonthlyForm } from "@/components/monthly/CreateMonthlyForm";
import { useMonthlyData } from "@/features/monthly-overview/use-monthly-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MONTH_NAMES = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function MonthlyOverviewPage() {
  const {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    overview,
    isLoading,
    error,
    isNotFound,
    handleCreateOverview,
    handleAddSupporter,
    handleAddDistribution,
    handleExport,
    isExporting,
  } = useMonthlyData();

  const [supporterDialogOpen, setSupporterDialogOpen] = useState(false);
  const [distributionDialogOpen, setDistributionDialogOpen] = useState(false);

  const monthName = MONTH_NAMES[selectedMonth] ?? "";

  return (
    <PageContent
      title="Monthly Overview"
      description={`Donation overview for ${monthName} ${selectedYear}`}
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
        <CreateMonthlyForm
          year={selectedYear}
          month={selectedMonth}
          onSubmit={handleCreateOverview}
        />
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
                Exchange Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground shrink-0 text-sm">
                  1 JPY =
                </Label>
                <Input
                  type="number"
                  value={overview.exchangeRate}
                  readOnly
                  className="w-32"
                />
                <span className="text-muted-foreground text-sm">MMK</span>
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
              onAddClick={() => setSupporterDialogOpen(true)}
            />
            <DistributionTable
              distributions={overview.distributions}
              totalDonated={overview.totalDonated}
              onAddClick={() => setDistributionDialogOpen(true)}
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
