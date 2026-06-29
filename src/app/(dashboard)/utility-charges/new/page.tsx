"use client";

import { OverheadChargeNewPage } from "@/components/charges/OverheadChargeNewPage";
import { utilityChargeModule } from "@/config/charge-modules";
import { utilityChargesApi } from "@/lib/api/utility-charges";

export default function NewUtilityChargePage() {
  return <OverheadChargeNewPage module={utilityChargeModule} api={utilityChargesApi} />;
}
