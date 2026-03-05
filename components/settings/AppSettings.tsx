"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Settings, Upload, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/features/settings/use-app-settings";

export function AppSettings() {
  const t = useTranslations("settings.appSettings");
  const tt = useTranslations("toast.settings");
  const { appName, appLogo } = useAppSettings();
  const queryClient = useQueryClient();

  const [name, setName] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentName = name ?? appName;

  async function handleSave() {
    setIsSaving(true);

    try {
      if (name !== null && name !== appName) {
        const res = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appName: name }),
        });

        if (!res.ok) {
          toast.error(tt("updateError"));
          setIsSaving(false);
          return;
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["app-settings"] });

      if (name !== null && name !== appName) {
        toast.success(tt("updateSuccess"));
      }

      setName(null);
    } catch {
      toast.error(tt("updateError"));
    } finally {
      setIsSaving(false);
    }
  }

  const hasChanges = name !== null && name !== appName;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="text-muted-foreground size-5" />
          <CardTitle className="text-base">{t("title")}</CardTitle>
        </div>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo */}
        <div className="space-y-2">
          <Label>{t("logo")}</Label>
          <p className="text-muted-foreground text-sm">
            {t("logoDescription")}
          </p>
          <div className="flex items-center gap-4">
            <Image
              src={appLogo}
              alt={currentName}
              width={64}
              height={64}
              className="rounded-full"
              unoptimized
            />
            <div className="space-y-1">
              <Button variant="outline" size="sm" disabled>
                <Upload className="mr-1 size-4" />
                {t("changeLogo")}
              </Button>
              <p className="text-xs text-red-400">{t("logoComingSoon")}</p>
            </div>
          </div>
        </div>

        {/* App Name */}
        <div className="space-y-2">
          <Label htmlFor="appName">{t("appName")}</Label>
          <Input
            id="appName"
            value={currentName}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("appNamePlaceholder")}
          />
        </div>

        {/* Save */}
        <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              {t("saving")}
            </>
          ) : (
            t("save")
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
