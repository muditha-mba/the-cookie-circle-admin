"use client";

import { OverheadChargeNewPage } from "@/components/charges/OverheadChargeNewPage";
import { labourChargeModule } from "@/config/charge-modules";
import { labourChargesApi } from "@/lib/api/labour-charges";

export default function NewLabourChargePage() {
  return <OverheadChargeNewPage module={labourChargeModule} api={labourChargesApi} />;
}
