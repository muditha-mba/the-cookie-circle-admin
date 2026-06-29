"use client";

import { Factory, Gauge, Layers, Package, ShoppingCart, Users } from "lucide-react";

import type { AnalyticsVisualCategory } from "@/components/analytics/analytics-categories";
import { ANALYTICS_CATEGORY_ACCENT_VAR } from "@/components/analytics/analytics-categories";
import { cn } from "@/lib/utils";

type AnalyticsInsightCardProps = {
  title: string;
  name: string | null;
  metricLabel: string;
  metricValue: string;
  entityType:
    | "product"
    | "collection"
    | "package"
    | "customer"
    | "production"
    | "order"
    | "operations";
  className?: string;
};

function categoryForEntity(
  entityType:
    | "product"
    | "collection"
    | "package"
    | "customer"
    | "production"
    | "order"
    | "operations",
): AnalyticsVisualCategory {
  if (entityType === "operations") {
    return "operations";
  }
  if (entityType === "product") {
    return "products";
  }
  if (entityType === "production") {
    return "production";
  }
  if (entityType === "collection") {
    return "collections";
  }
  if (entityType === "package") {
    return "packages";
  }
  if (entityType === "order") {
    return "orders";
  }
  return "customers";
}

export function AnalyticsInsightCard({
  title,
  name,
  metricLabel,
  metricValue,
  entityType,
  className,
}: AnalyticsInsightCardProps) {
  const category = categoryForEntity(entityType);
  const accent = ANALYTICS_CATEGORY_ACCENT_VAR[category];
  const soft =
    category === "products"
      ? "var(--analytics-products-soft)"
      : category === "production"
        ? "var(--analytics-production-soft)"
        : category === "collections"
          ? "var(--analytics-collections-soft)"
          : category === "packages"
            ? "var(--analytics-packages-soft)"
          : category === "orders"
            ? "var(--analytics-orders-soft)"
            : category === "operations"
              ? "var(--analytics-operations-soft)"
              : "var(--analytics-customers-soft)";
  const Icon =
    entityType === "product"
      ? Package
      : entityType === "collection"
        ? Layers
        : entityType === "package"
          ? Layers
        : entityType === "production"
          ? Factory
          : entityType === "order"
            ? ShoppingCart
            : entityType === "operations"
              ? Gauge
              : Users;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-surface-elevated p-5 shadow-sm",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      <div className="flex items-start gap-3">
        <div className="rounded-lg p-2.5" style={{ backgroundColor: soft }}>
          <Icon className="h-4 w-4" style={{ color: accent }} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            {title}
          </p>
          <p className="mt-2 truncate text-base font-semibold text-text-primary">
            {name ?? "No data yet"}
          </p>
          <div className="mt-3 flex items-baseline justify-between gap-2 border-t border-border/60 pt-3">
            <span className="text-xs text-text-muted">{metricLabel}</span>
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color: accent }}
            >
              {metricValue}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
