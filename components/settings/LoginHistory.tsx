"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Monitor,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 5;

type LoginLog = {
  id: string;
  timestamp: string;
  actionType: string;
  ipAddress: string | null;
  status: string;
};

type LoginHistoryResponse = {
  data: LoginLog[];
  total: number;
  page: number;
  pageSize: number;
};

export function LoginHistory() {
  const t = useTranslations("settings.loginHistory");
  const tc = useTranslations("common");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<LoginHistoryResponse>({
    queryKey: ["login-history", page],
    queryFn: async () => {
      const res = await fetch(
        `/api/profile/login-history?page=${page}&pageSize=${PAGE_SIZE}`,
      );
      if (!res.ok) throw new Error("Failed to fetch login history");
      return res.json();
    },
  });

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Monitor className="text-muted-foreground size-5" />
          <CardTitle className="text-base">{t("title")}</CardTitle>
        </div>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("empty")}</p>
        ) : (
          <>
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {log.status === "Success" ? (
                      <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                    ) : (
                      <XCircle className="size-4 shrink-0 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {log.actionType === "Login"
                          ? t("loginSuccess")
                          : t("loginFailed")}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {log.ipAddress ?? t("unknownIp")}
                  </Badge>
                </div>
              ))}
            </div>

            {total > PAGE_SIZE && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-muted-foreground text-sm">
                  {tc("showing", {
                    from: (page - 1) * PAGE_SIZE + 1,
                    to: Math.min(page * PAGE_SIZE, total),
                    total,
                    item: "logs",
                  })}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft />
                    <span className="sr-only">{tc("previousPage")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight />
                    <span className="sr-only">{tc("nextPage")}</span>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
