"use client";

import { OverheadChargeEditPage } from "@/components/charges/OverheadChargeEditPage";
import { utilityChargeModule } from "@/config/charge-modules";
import { utilityChargesApi } from "@/lib/api/utility-charges";

export default function EditUtilityChargePage() {
  return <OverheadChargeEditPage module={utilityChargeModule} api={utilityChargesApi} />;
}
