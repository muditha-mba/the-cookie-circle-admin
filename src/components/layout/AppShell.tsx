import type { ReactNode } from "react";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

type AppShellProps = {
  children: ReactNode;
  title: string;
  description?: string;
};

export function AppShell({ children, title, description }: AppShellProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background text-text-primary">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header title={title} description={description} />
        <main className="min-h-0 flex-1 overflow-y-auto px-6 py-8 md:px-10">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
