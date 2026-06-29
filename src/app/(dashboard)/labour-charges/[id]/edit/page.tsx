"use client";

import { OverheadChargeEditPage } from "@/components/charges/OverheadChargeEditPage";
import { labourChargeModule } from "@/config/charge-modules";
import { labourChargesApi } from "@/lib/api/labour-charges";

export default function EditLabourChargePage() {
  return <OverheadChargeEditPage module={labourChargeModule} api={labourChargesApi} />;
}
