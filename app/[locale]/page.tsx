"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Heart, Building2, FileBarChart } from "lucide-react";
import { useAppSettings } from "@/features/settings/use-app-settings";

export default function HomePage() {
  const t = useTranslations("home");
  const { appName, appLogo } = useAppSettings();

  return (
    <main className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2">
          <Image
            src={appLogo}
            alt={appName}
            width={32}
            height={32}
            className="shrink-0 rounded-full"
            unoptimized
          />
          <span className="text-lg font-semibold tracking-tight">
            {appName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button asChild size="sm">
            <Link href="/auth/login">{t("cta")}</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <Image
          src={appLogo}
          alt={appName}
          width={64}
          height={64}
          className="rounded-full"
          priority
          unoptimized
        />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {appName}
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          {t("subtitle")}
        </p>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/40 px-4 py-16">
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
          <FeatureCard
            icon={<Heart className="size-5 text-primary" />}
            title={t("features.tracking.title")}
            description={t("features.tracking.description")}
          />
          <FeatureCard
            icon={<Building2 className="size-5 text-primary" />}
            title={t("features.distribution.title")}
            description={t("features.distribution.description")}
          />
          <FeatureCard
            icon={<FileBarChart className="size-5 text-primary" />}
            title={t("features.reporting.title")}
            description={t("features.reporting.description")}
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
