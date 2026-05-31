"use client";

import type { ReactNode } from "react";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <AuthGuard>{children}</AuthGuard>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
