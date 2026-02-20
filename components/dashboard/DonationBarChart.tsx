"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyChartItem } from "@/features/dashboard/types";

type Props = {
  title: string;
  collectedLabel: string;
  donatedLabel: string;
  data: MonthlyChartItem[];
  emptyText: string;
};

export function DonationBarChart({
  title,
  collectedLabel,
  donatedLabel,
  data,
  emptyText,
}: Props) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">{title}</h3>
      {data.length === 0 ? (
        <div className="flex h-75 items-center justify-center">
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="month"
              className="text-xs fill-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--popover))",
                color: "hsl(var(--popover-foreground))",
                fontSize: "12px",
              }}
              formatter={(value) => `${Number(value).toLocaleString()} MMK`}
            />
            <Bar
              dataKey="collected"
              name={collectedLabel}
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="donated"
              name={donatedLabel}
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
