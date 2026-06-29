/**
 * Central status badge labels and styles for admin UI.
 * Import from here instead of duplicating maps in components.
 */

import type { CustomerSegment } from "@/lib/api/customers";
import type { OrderStatus, PaymentStatus } from "@/lib/api/orders";
import type {
  ProductionBatchStatus,
  PurchasePlanningStatus,
} from "@/lib/api/production";

export type StatusBadgeDefinition = {
  label: string;
  /** Tailwind utility classes for badge surface, border, and text. */
  className: string;
};

const badgeStyles = {
  neutral: "border-border bg-surface-hover text-text-secondary",
  info: "border-info/30 bg-info/10 text-info",
  primary: "border-primary/30 bg-primary/10 text-primary",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
  muted: "border-border bg-background text-text-muted",
} as const;

export const ORDER_STATUS_BADGES: Record<OrderStatus, StatusBadgeDefinition> = {
  draft: { label: "Draft", className: badgeStyles.muted },
  pending: { label: "Pending", className: badgeStyles.warning },
  confirmed: { label: "Confirmed", className: badgeStyles.info },
  preparing: { label: "Preparing", className: badgeStyles.primary },
  ready: { label: "Ready", className: badgeStyles.success },
  delivered: { label: "Delivered", className: badgeStyles.success },
  cancelled: { label: "Cancelled", className: badgeStyles.danger },
};

export const PAYMENT_STATUS_BADGES: Record<PaymentStatus, StatusBadgeDefinition> = {
  pending: { label: "Pending", className: badgeStyles.warning },
  paid: { label: "Paid", className: badgeStyles.success },
  failed: { label: "Failed", className: badgeStyles.danger },
  refunded: { label: "Refunded", className: badgeStyles.neutral },
};

export const PURCHASE_PLANNING_STATUS_BADGES: Record<
  PurchasePlanningStatus,
  StatusBadgeDefinition
> = {
  not_planned: { label: "Not Planned", className: badgeStyles.muted },
  planned: { label: "Planned", className: badgeStyles.info },
  ordered: { label: "Ordered", className: badgeStyles.success },
};

export const PRODUCTION_BATCH_STATUS_BADGES: Record<
  ProductionBatchStatus,
  StatusBadgeDefinition
> = {
  draft: { label: "Draft", className: badgeStyles.muted },
  planning: { label: "Planning", className: badgeStyles.info },
  ready: { label: "Ready", className: badgeStyles.success },
};

export const CUSTOMER_SEGMENT_BADGES: Record<CustomerSegment, StatusBadgeDefinition> = {
  new: { label: "New", className: badgeStyles.info },
  returning: { label: "Returning", className: badgeStyles.primary },
  vip: { label: "VIP", className: badgeStyles.warning },
  inactive: { label: "Inactive", className: badgeStyles.neutral },
};

export type StatusBadgeKind =
  | "order"
  | "payment"
  | "purchase-planning"
  | "production-batch"
  | "customer-segment";

export const STATUS_BADGE_REGISTRY = {
  order: ORDER_STATUS_BADGES,
  payment: PAYMENT_STATUS_BADGES,
  "purchase-planning": PURCHASE_PLANNING_STATUS_BADGES,
  "production-batch": PRODUCTION_BATCH_STATUS_BADGES,
  "customer-segment": CUSTOMER_SEGMENT_BADGES,
} as const;

export type StatusBadgeValue<K extends StatusBadgeKind> =
  keyof (typeof STATUS_BADGE_REGISTRY)[K];

export function getStatusBadgeDefinition<K extends StatusBadgeKind>(
  kind: K,
  value: StatusBadgeValue<K>,
): StatusBadgeDefinition {
  const registry = STATUS_BADGE_REGISTRY[kind];
  return registry[value as keyof typeof registry] as StatusBadgeDefinition;
}

export function getStatusLabel<K extends StatusBadgeKind>(
  kind: K,
  value: StatusBadgeValue<K>,
): string {
  return getStatusBadgeDefinition(kind, value).label;
}

export function statusSelectOptions<K extends StatusBadgeKind>(
  kind: K,
): { value: StatusBadgeValue<K>; label: string }[] {
  const registry = STATUS_BADGE_REGISTRY[kind];
  return (Object.keys(registry) as StatusBadgeValue<K>[]).map((value) => ({
    value,
    label: getStatusBadgeDefinition(kind, value).label,
  }));
}

export const ORDER_STATUS_OPTIONS = statusSelectOptions("order");
export const PAYMENT_STATUS_OPTIONS = statusSelectOptions("payment");
export const PURCHASE_PLANNING_STATUS_OPTIONS = statusSelectOptions("purchase-planning");
export const PRODUCTION_BATCH_STATUS_OPTIONS = statusSelectOptions("production-batch");
