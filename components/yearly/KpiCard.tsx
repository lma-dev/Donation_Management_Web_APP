"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  highlighted?: boolean;
};

export function KpiCard({
  title,
  value,
  icon: Icon,
  highlighted,
}: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="text-muted-foreground size-4" />
      </CardHeader>
      <CardContent>
        <p
          className={`text-right text-2xl font-bold tabular-nums ${highlighted ? "text-primary" : ""}`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
