"use client";

import { OverheadChargeList } from "@/components/charges/OverheadChargeList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { utilityChargeModule } from "@/config/charge-modules";
import { utilityChargesApi } from "@/lib/api/utility-charges";

export default function UtilityChargesPage() {
  return (
    <DashboardPageShell
      title={utilityChargeModule.title}
      description={utilityChargeModule.description}
    >
      <OverheadChargeList module={utilityChargeModule} api={utilityChargesApi} />
    </DashboardPageShell>
  );
}
