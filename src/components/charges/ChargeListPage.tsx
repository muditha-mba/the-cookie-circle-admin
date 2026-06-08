"use client";

import { ChargeList } from "@/components/charges/ChargeList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import type { ChargeModuleId } from "@/config/charge-modules";
import { getChargeModule } from "@/config/charge-modules.client";

type ChargeListPageProps = {
  moduleId: ChargeModuleId;
};

export function ChargeListPage({ moduleId }: ChargeListPageProps) {
  const module = getChargeModule(moduleId);
  return (
    <DashboardPageShell title={module.title} description={module.description}>
      <ChargeList module={module} />
    </DashboardPageShell>
  );
}
