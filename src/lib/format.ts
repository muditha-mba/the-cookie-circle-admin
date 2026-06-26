/** Display formatting helpers. */

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatYearMonth(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1] ?? month} ${year}`;
}

function toDisplayNumber(value: string | number): number | null {
  const amount = typeof value === "string" ? Number(value) : value;
  return Number.isNaN(amount) ? null : amount;
}

/** Whole-number counts (cookies, packs, order quantities, yield). */
export function formatCount(value: string | number): string {
  const amount = toDisplayNumber(value);
  if (amount == null) {
    return "—";
  }
  return Math.round(amount).toLocaleString("en-LK");
}

/** Measurable quantities that may include decimals (shown to 2 dp). */
export function formatDecimal(value: string | number): string {
  const amount = toDisplayNumber(value);
  if (amount == null) {
    return "—";
  }
  if (Number.isInteger(amount)) {
    return amount.toLocaleString("en-LK");
  }
  return amount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

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
  const formatted = formatDecimal(value);
  if (formatted === "—") {
    return unit;
  }
  return `${formatted} ${unit}`;
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
  }).format(new Date(value.includes("T") ? value : `${value}T12:00:00`));
}

export function formatPercent(value: string | number, fractionDigits = 1): string {
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) {
    return "—";
  }
  return `${amount.toFixed(fractionDigits)}%`;
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
