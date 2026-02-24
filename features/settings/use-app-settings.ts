"use client";

import { useQuery } from "@tanstack/react-query";

type AppSettings = {
  appName: string;
  appLogo: string;
};

const DEFAULTS: AppSettings = {
  appName: "Spring Liberation Rose",
  appLogo: "/logo.svg",
};

export function useAppSettings() {
  const { data, isLoading } = useQuery<AppSettings>({
    queryKey: ["app-settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    appName: data?.appName ?? DEFAULTS.appName,
    appLogo: data?.appLogo ?? DEFAULTS.appLogo,
    isLoading,
  };
}
