"use client";

import type { ChargeModuleId, ChargeModuleMeta, OverheadModuleMeta, TaxModuleMeta } from "@/config/charge-modules";
import {
  labourChargeModule,
  taxChargeModule,
  utilityChargeModule,
} from "@/config/charge-modules";
import type { OverheadChargeApi, TaxChargeApi } from "@/lib/api/charge-types";
import { labourChargesApi } from "@/lib/api/labour-charges";
import { taxChargesApi } from "@/lib/api/tax-charges";
import { utilityChargesApi } from "@/lib/api/utility-charges";

export type OverheadModuleConfig = OverheadModuleMeta & {
  api: OverheadChargeApi;
};

export type TaxModuleConfig = TaxModuleMeta & {
  api: TaxChargeApi;
};

export type ChargeModuleConfig = OverheadModuleConfig | TaxModuleConfig;

const overheadModules: Record<string, OverheadModuleMeta> = {
  "utility-charges": utilityChargeModule,
  "labour-charges": labourChargeModule,
};

const overheadApis: Record<string, OverheadChargeApi> = {
  "utility-charges": utilityChargesApi,
  "labour-charges": labourChargesApi,
};

export function getOverheadModule(id: "utility-charges" | "labour-charges"): OverheadModuleConfig {
  return {
    ...overheadModules[id],
    api: overheadApis[id],
  };
}

export function getTaxModule(): TaxModuleConfig {
  return {
    ...taxChargeModule,
    api: taxChargesApi,
  };
}

/** @deprecated — use getOverheadModule or getTaxModule */
export function getChargeModule(id: ChargeModuleId): ChargeModuleConfig {
  if (id === "tax-charges") return getTaxModule();
  return getOverheadModule(id as "utility-charges" | "labour-charges");
}
