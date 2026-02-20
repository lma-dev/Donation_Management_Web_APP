"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { NavItem } from "./navigation";

type SidebarItemProps = {
  item: NavItem;
  collapsed: boolean;
};

export function SidebarItem({ item, collapsed }: SidebarItemProps) {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  // Strip locale prefix for matching (e.g., /en/dashboard -> /dashboard)
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/)/, "");
  const isActive = pathnameWithoutLocale === item.href;
  const Icon = item.icon;
  const label = t(item.labelKey);

  const linkContent = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}
