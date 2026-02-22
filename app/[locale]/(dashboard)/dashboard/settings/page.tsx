"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { PageContent } from "@/components/layout/PageContent";
import { PageGuide } from "@/components/layout/PageGuide";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { LoginHistory } from "@/components/settings/LoginHistory";
import { AppSettings } from "@/components/settings/AppSettings";
import { Languages } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { data: session } = useSession();
  const isSystemAdmin = session?.user?.role === "SYSTEM_ADMIN";

  return (
    <PageContent
      title={t("title")}
      description={t("description")}
      guide={
        <PageGuide
          title={t("guide.title")}
          description={t("guide.description")}
        />
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column – configuration */}
        <div className="space-y-6">
          {isSystemAdmin && <AppSettings />}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Languages className="text-muted-foreground size-5" />
                <CardTitle className="text-base">
                  {t("language.title")}
                </CardTitle>
              </div>
              <CardDescription>{t("language.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <LanguageSwitcher />
            </CardContent>
          </Card>
        </div>

        {/* Right column – activity */}
        <div>
          <LoginHistory />
        </div>
      </div>
    </PageContent>
  );
}
