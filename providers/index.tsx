"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "./query-client";
import { AuthSessionProvider } from "./session";

type Props = {
  children: ReactNode;
};

export function Providers({ children }: Props) {
  return (
    <AuthSessionProvider>
      <QueryProvider>{children}</QueryProvider>
    </AuthSessionProvider>
  );
}
