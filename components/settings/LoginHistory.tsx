"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Monitor, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type LoginLog = {
  id: string;
  timestamp: string;
  actionType: string;
  ipAddress: string | null;
  status: string;
};

export function LoginHistory() {
  const t = useTranslations("settings.loginHistory");

  const { data: logs = [], isLoading } = useQuery<LoginLog[]>({
    queryKey: ["login-history"],
    queryFn: async () => {
      const res = await fetch("/api/profile/login-history");
      if (!res.ok) throw new Error("Failed to fetch login history");
      return res.json();
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Monitor className="text-muted-foreground size-5" />
          <CardTitle className="text-base">{t("title")}</CardTitle>
        </div>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("empty")}</p>
        ) : (
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
                      {log.actionType === "Login" ? t("loginSuccess") : t("loginFailed")}
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
        )}
      </CardContent>
    </Card>
  );
}
