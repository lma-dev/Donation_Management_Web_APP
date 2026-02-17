import {
  BarChart3,
  CalendarRange,
  CalendarDays,
  Users,
  MapPin,
  Settings,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navigation: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        label: "Monthly Overview",
        href: "/dashboard/monthly",
        icon: CalendarDays,
      },
      {
        label: "Yearly Overview",
        href: "/dashboard/yearly",
        icon: CalendarRange,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "User Management",
        href: "/user-management",
        icon: Users,
      },
      {
        label: "Donation Places",
        href: "/donation-place-management",
        icon: MapPin,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Activity Logs",
        href: "/activity-logs",
        icon: ScrollText,
      },
      {
        label: "Application Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];
