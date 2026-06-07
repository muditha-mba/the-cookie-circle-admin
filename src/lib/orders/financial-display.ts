/** Display helpers for order financial breakdown tables. */

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
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) {
    return "—";
  }
  return Number.isInteger(amount) ? amount.toString() : amount.toFixed(2).replace(/\.?0+$/, "");
}
