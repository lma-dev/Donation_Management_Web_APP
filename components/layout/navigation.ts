import {
  LayoutDashboard,
  CalendarRange,
  CalendarDays,
  Users,
  MapPin,
  Settings,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types/user";

export type NavItem = {
  labelKey: string;
  href: string;
  icon: LucideIcon;
  minRole?: UserRole;
};

export type NavSection = {
  titleKey: string;
  items: NavItem[];
};

export const navigation: NavSection[] = [
  {
    titleKey: "sections.dashboard",
    items: [
      {
        labelKey: "items.dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        labelKey: "items.monthlyOverview",
        href: "/dashboard/monthly",
        icon: CalendarDays,
      },
      {
        labelKey: "items.yearlyOverview",
        href: "/dashboard/yearly",
        icon: CalendarRange,
      },
    ],
  },
  {
    titleKey: "sections.management",
    items: [
      {
        labelKey: "items.userManagement",
        href: "/user-management",
        icon: Users,
        minRole: "ADMIN",
      },
      {
        labelKey: "items.donationPlaces",
        href: "/donation-place-management",
        icon: MapPin,
        minRole: "ADMIN",
      },
    ],
  },
  {
    titleKey: "sections.system",
    items: [
      {
        labelKey: "items.activityLogs",
        href: "/activity-logs",
        icon: ScrollText,
        minRole: "SYSTEM_ADMIN",
      },
      {
        labelKey: "items.applicationSettings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];
