"use client";

import { OverheadChargeDetailPage } from "@/components/charges/OverheadChargeDetailPage";
import { utilityChargeModule } from "@/config/charge-modules";
import { utilityChargesApi } from "@/lib/api/utility-charges";

export default function UtilityChargeDetailPage() {
  return <OverheadChargeDetailPage module={utilityChargeModule} api={utilityChargesApi} />;
}
