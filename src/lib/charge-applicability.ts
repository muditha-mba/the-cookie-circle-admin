import type { Charge } from "@/lib/api/charge-types";

export type ChargeApplicability = "product" | "collection" | "both";

export function chargeAppliesToProduct(charge: Charge): boolean {
  return charge.applicability === "product" || charge.applicability === "both";
}

export function chargeAppliesToCollection(charge: Charge): boolean {
  return charge.applicability === "collection" || charge.applicability === "both";
}

export function formatChargeApplicability(value: ChargeApplicability): string {
  switch (value) {
    case "product":
      return "Product";
    case "collection":
      return "Collection";
    case "both":
      return "Both";
    default:
      return value;
  }
}
