/** Display formatting helpers. */

export function formatCurrency(value: string | number): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) {
    return "—";
  }
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatQuantity(value: string | number, unit: string): string {
  const qty = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(qty)) {
    return unit;
  }
  const formatted = Number.isInteger(qty) ? qty.toString() : qty.toFixed(2);
  return `${formatted} ${unit}`;
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatChargeAmount(
  amount: string | number,
  chargeType: "fixed" | "percentage",
): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value)) {
    return "—";
  }
  if (chargeType === "percentage") {
    return `${value}%`;
  }
  return formatCurrency(value);
}
