export type MonthlyChartItem = {
  month: string;
  collected: number;
  donated: number;
};

export type DistributionByPlace = {
  name: string;
  value: number;
};

export type DashboardResponse = {
  totalUsers: number;
  monthlyChart: MonthlyChartItem[];
  distributionByPlace: DistributionByPlace[];
};
