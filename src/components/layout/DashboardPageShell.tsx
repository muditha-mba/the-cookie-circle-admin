import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";

type DashboardPageShellProps = {
  children: ReactNode;
  title: string;
  description?: string;
};

export function DashboardPageShell({
  children,
  title,
  description,
}: DashboardPageShellProps) {
  return (
    <AppShell title={title} description={description}>
      {children}
    </AppShell>
  );
}
