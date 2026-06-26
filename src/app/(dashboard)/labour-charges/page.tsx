"use client";

import { OverheadChargeList } from "@/components/charges/OverheadChargeList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { labourChargeModule } from "@/config/charge-modules";
import { labourChargesApi } from "@/lib/api/labour-charges";

export default function LabourChargesPage() {
  return (
    <DashboardPageShell
      title={labourChargeModule.title}
      description={labourChargeModule.description}
    >
      <OverheadChargeList module={labourChargeModule} api={labourChargesApi} />
    </DashboardPageShell>
  );
}
