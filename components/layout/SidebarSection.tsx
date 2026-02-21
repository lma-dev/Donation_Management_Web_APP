"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { hasMinRole } from "@/lib/permissions";
import { SidebarItem } from "./SidebarItem";
import type { NavSection } from "./navigation";

type SidebarSectionProps = {
  section: NavSection;
  collapsed: boolean;
};

export function SidebarSection({ section, collapsed }: SidebarSectionProps) {
  const t = useTranslations("navigation");
  const { data: session } = useSession();
  const userRole = session?.user?.role ?? "USER";

  const visibleItems = section.items.filter(
    (item) => !item.minRole || hasMinRole(userRole, item.minRole),
  );

  if (visibleItems.length === 0) return null;

  return (
    <div className="space-y-1">
      <p
        className={cn(
          "px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70",
          collapsed && "sr-only"
        )}
      >
        {t(section.titleKey)}
      </p>
      <div className="space-y-0.5">
        {visibleItems.map((item) => (
          <SidebarItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </div>
    </div>
  );
}
