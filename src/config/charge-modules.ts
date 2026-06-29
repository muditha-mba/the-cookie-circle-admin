/** Serializable charge module configuration (safe for server components). */

import { routes } from "@/config/routes";

export type ChargeModuleId = "utility-charges" | "labour-charges" | "tax-charges";

export type OverheadModuleMeta = {
  id: ChargeModuleId;
  type: "overhead";
  title: string;
  singular: string;
  description: string;
  queryKey: string;
  routes: {
    list: string;
    create: string;
    detail: (id: string) => string;
    edit: (id: string) => string;
  };
};

export type TaxModuleMeta = {
  id: ChargeModuleId;
  type: "tax";
  title: string;
  singular: string;
  description: string;
  queryKey: string;
  routes: {
    list: string;
    create: string;
    detail: (id: string) => string;
    edit: (id: string) => string;
  };
};

export type ChargeModuleMeta = OverheadModuleMeta | TaxModuleMeta;

export const utilityChargeModule: OverheadModuleMeta = {
  id: "utility-charges",
  type: "overhead",
  title: "Utility Charges",
  singular: "Utility charge",
  description: "Track monthly utility costs like electricity, water, and internet.",
  queryKey: "utility-charges",
  routes: routes.utilityCharges,
};

export const labourChargeModule: OverheadModuleMeta = {
  id: "labour-charges",
  type: "overhead",
  title: "Labour Charges",
  singular: "Labour charge",
  description: "Track monthly labour costs like preparation, packaging, and administration.",
  queryKey: "labour-charges",
  routes: routes.labourCharges,
};

export const taxChargeModule: TaxModuleMeta = {
  id: "tax-charges",
  type: "tax",
  title: "Tax Charges",
  singular: "Tax charge",
  description: "Define taxes and fees applied automatically to every order.",
  queryKey: "tax-charges",
  routes: routes.taxCharges,
};
