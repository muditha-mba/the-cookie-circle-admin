"use client";

import { OverheadChargeDetailPage } from "@/components/charges/OverheadChargeDetailPage";
import { labourChargeModule } from "@/config/charge-modules";
import { labourChargesApi } from "@/lib/api/labour-charges";

export default function LabourChargeDetailPage() {
  return <OverheadChargeDetailPage module={labourChargeModule} api={labourChargesApi} />;
}
