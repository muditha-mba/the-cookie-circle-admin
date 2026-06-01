/** Serializable charge module configuration (safe for server components). */

import { routes } from "@/config/routes";

export type ChargeModuleId = "utility-charges" | "labour-charges" | "tax-charges";

export type ChargeModuleMeta = {
  id: ChargeModuleId;
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

export const utilityChargeModule: ChargeModuleMeta = {
  id: "utility-charges",
  title: "Utility Charges",
  singular: "Utility charge",
  description: "Manage business-wide utility costs.",
  queryKey: "utility-charges",
  routes: routes.utilityCharges,
};

export const labourChargeModule: ChargeModuleMeta = {
  id: "labour-charges",
  title: "Labour Charges",
  singular: "Labour charge",
  description: "Manage business-wide labour costs.",
  queryKey: "labour-charges",
  routes: routes.labourCharges,
};

export const taxChargeModule: ChargeModuleMeta = {
  id: "tax-charges",
  title: "Tax Charges",
  singular: "Tax charge",
  description: "Manage taxes, fees, and marketplace charges.",
  queryKey: "tax-charges",
  routes: routes.taxCharges,
};
