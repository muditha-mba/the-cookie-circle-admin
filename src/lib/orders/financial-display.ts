/** Display helpers for order financial breakdown tables. */

import { formatCount } from "@/lib/format";

export function marginToneClass(margin: number): string {
  if (margin > 60) {
    return "text-success";
  }
  if (margin >= 40) {
    return "text-warning";
  }
  return "text-danger";
}

export function parseAmount(value: string | number | null | undefined): number | null {
  if (value == null) {
    return null;
  }
  const amount = typeof value === "string" ? Number(value) : value;
  return Number.isNaN(amount) ? null : amount;
}

export function formatQuantityDisplay(value: string | number): string {
  return formatCount(value);
}

export function cookieRevenueFromCollections(
  collectionsSubtotal: string,
  packageFeeRevenue: string,
): number {
  const collections = parseAmount(collectionsSubtotal) ?? 0;
  const packageFee = parseAmount(packageFeeRevenue) ?? 0;
  return Math.max(0, collections - packageFee);
}

export type OrderFinancialBreakdownType = "weekly_delivery" | "catering";

export function resolveFinancialBreakdownType(
  orderType: OrderFinancialBreakdownType | undefined,
  snapshot: {
    products_subtotal_snapshot: string;
    collections_subtotal_snapshot: string;
  },
): OrderFinancialBreakdownType | undefined {
  if (orderType) {
    return orderType;
  }

  const products = parseAmount(snapshot.products_subtotal_snapshot) ?? 0;
  const collections = parseAmount(snapshot.collections_subtotal_snapshot) ?? 0;

  if (products > 0 && collections === 0) {
    return "catering";
  }
  if (collections > 0 && products === 0) {
    return "weekly_delivery";
  }

  return undefined;
}
