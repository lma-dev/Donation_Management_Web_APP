"use client";

import { useTranslations } from "next-intl";
import { PageContent } from "@/components/layout/PageContent";
import { PageGuide } from "@/components/layout/PageGuide";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { LoginHistory } from "@/components/settings/LoginHistory";
import { Languages } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("settings");

  return (
    <PageContent title={t("title")} description={t("description")} guide={<PageGuide title={t("guide.title")} description={t("guide.description")} />}>
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Languages className="text-muted-foreground size-5" />
              <CardTitle className="text-base">{t("language.title")}</CardTitle>
            </div>
            <CardDescription>{t("language.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSwitcher />
          </CardContent>
        </Card>
        <LoginHistory />
      </div>
    </PageContent>
  );
}
