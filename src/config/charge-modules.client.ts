"use client";

import type { ChargeModuleId, ChargeModuleMeta } from "@/config/charge-modules";
import {
  labourChargeModule,
  taxChargeModule,
  utilityChargeModule,
} from "@/config/charge-modules";
import type { ChargeApi } from "@/lib/api/charge-types";
import { labourChargesApi } from "@/lib/api/labour-charges";
import { taxChargesApi } from "@/lib/api/tax-charges";
import { utilityChargesApi } from "@/lib/api/utility-charges";

export type ChargeModuleConfig = ChargeModuleMeta & {
  api: ChargeApi;
};

const modules: Record<ChargeModuleId, ChargeModuleMeta> = {
  "utility-charges": utilityChargeModule,
  "labour-charges": labourChargeModule,
  "tax-charges": taxChargeModule,
};

const apis: Record<ChargeModuleId, ChargeApi> = {
  "utility-charges": utilityChargesApi,
  "labour-charges": labourChargesApi,
  "tax-charges": taxChargesApi,
};

export function getChargeModule(id: ChargeModuleId): ChargeModuleConfig {
  return {
    ...modules[id],
    api: apis[id],
  };
}
