import {
  BarChart3,
  CalendarRange,
  CalendarDays,
  Users,
  Settings,
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
        href: "/dashboard",
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
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Application Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];
