"use client";

import { cn } from "@/lib/utils";
import { SidebarItem } from "./SidebarItem";
import type { NavSection } from "./navigation";

type SidebarSectionProps = {
  section: NavSection;
  collapsed: boolean;
};

export function SidebarSection({ section, collapsed }: SidebarSectionProps) {
  return (
    <div className="space-y-1">
      <p
        className={cn(
          "px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70",
          collapsed && "sr-only"
        )}
      >
        {section.title}
      </p>
      <div className="space-y-0.5">
        {section.items.map((item) => (
          <SidebarItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </div>
    </div>
  );
}
