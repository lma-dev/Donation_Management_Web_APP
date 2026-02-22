"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { PanelLeftClose, PanelLeft, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidebarSection } from "./SidebarSection";
import { navigation } from "./navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAppSettings } from "@/features/settings/use-app-settings";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

function SidebarHeader({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("navigation");
  const { appName, appLogo } = useAppSettings();

  return (
    <div
      className={cn(
        "flex h-16 items-center border-b border-border px-4",
        collapsed ? "justify-center" : "justify-between",
      )}
    >
      <div className={cn("flex items-center gap-2", collapsed && "hidden")}>
        <Image
          src={appLogo}
          alt={appName}
          width={32}
          height={32}
          className="shrink-0 rounded-full"
          unoptimized
        />
        <span className="text-lg font-bold tracking-tight">{appName}</span>
      </div>
      {collapsed && (
        <Image
          src={appLogo}
          alt={appName}
          width={28}
          height={28}
          className="rounded-full"
          unoptimized
        />
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
        className="h-8 w-8"
      >
        {collapsed ? (
          <PanelLeft className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

function SidebarNav({ collapsed }: { collapsed: boolean }) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {navigation.map((section, index) => (
        <SidebarSection
          key={section.titleKey}
          section={section}
          collapsed={collapsed}
          showSeparator={index > 0}
        />
      ))}
    </nav>
  );
}

function DesktopSidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden h-screen flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out lg:flex",
        collapsed ? "w-18" : "w-60",
      )}
    >
      <SidebarHeader collapsed={collapsed} onToggle={onToggle} />
      <SidebarNav collapsed={collapsed} />
    </aside>
  );
}

function MobileSidebar({
  mobileOpen,
  onMobileOpenChange,
}: Pick<SidebarProps, "mobileOpen" | "onMobileOpenChange">) {
  const t = useTranslations("navigation");
  const { appName, appLogo } = useAppSettings();

  return (
    <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
      <SheetContent side="left" className="w-60 p-0" showCloseButton={false}>
        <SheetTitle className="sr-only">{t("navigationMenu")}</SheetTitle>
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <Image
              src={appLogo}
              alt={appName}
              width={32}
              height={32}
              className="shrink-0 rounded-full"
              unoptimized
            />
            <span className="text-lg font-bold tracking-tight">
              {appName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMobileOpenChange(false)}
            aria-label={t("closeSidebar")}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SidebarNav collapsed={false} />
      </SheetContent>
    </Sheet>
  );
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileOpenChange,
}: SidebarProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Close mobile drawer when switching to desktop
  useEffect(() => {
    if (isDesktop && mobileOpen) {
      onMobileOpenChange(false);
    }
  }, [isDesktop, mobileOpen, onMobileOpenChange]);

  return (
    <>
      <DesktopSidebar
        collapsed={collapsed}
        onToggle={onToggle}
        mobileOpen={mobileOpen}
        onMobileOpenChange={onMobileOpenChange}
      />
      <MobileSidebar
        mobileOpen={mobileOpen}
        onMobileOpenChange={onMobileOpenChange}
      />
    </>
  );
}
