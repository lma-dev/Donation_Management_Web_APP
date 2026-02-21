"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, RotateCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 text-destructive" />
            <CardTitle>{t("somethingWentWrong")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="size-4" />
            {t("tryAgain")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
