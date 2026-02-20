"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageContent } from "@/components/layout/PageContent";
import { DonationBarChart } from "@/components/dashboard/DonationBarChart";
import { DistributionPieChart } from "@/components/dashboard/DistributionPieChart";
import { useDashboardData } from "@/features/dashboard/use-dashboard-data";
import { Users, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { data, isLoading } = useDashboardData();

  return (
    <PageContent title={t("title")} description={t("description")}>
      {/* KPI Card */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("totalUsers")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-2xl font-bold">{data?.totalUsers ?? "--"}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex h-75 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <DonationBarChart
                title={t("monthlyTrend")}
                collectedLabel={t("collected")}
                donatedLabel={t("donated")}
                data={data?.monthlyChart ?? []}
                emptyText={t("noChartData")}
              />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="flex h-55 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <DistributionPieChart
                title={t("distributionByPlace")}
                data={data?.distributionByPlace ?? []}
                emptyText={t("noChartData")}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PageContent>
  );
}
