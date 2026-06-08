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
