"use client";

import type { ReactNode } from "react";
import { Provider as JotaiProvider } from "jotai";
import { QueryProvider } from "./query-client";
import { AuthSessionProvider } from "./session";
import { ThemeProvider } from "./theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <AuthSessionProvider>
      <ThemeProvider>
        <JotaiProvider>
          <TooltipProvider>
            <QueryProvider>{children}</QueryProvider>
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </JotaiProvider>
      </ThemeProvider>
    </AuthSessionProvider>
  );
}
