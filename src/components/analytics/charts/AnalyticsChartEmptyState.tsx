"use client";

import { BarChart2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  ANALYTICS_CATEGORY_ACCENT_VAR,
  type AnalyticsVisualCategory,
} from "@/components/analytics/analytics-categories";

const CATEGORY_SOFT_VAR: Record<AnalyticsVisualCategory, string> = {
  revenue: "var(--analytics-revenue-soft)",
  profit: "var(--analytics-profit-soft)",
  orders: "var(--analytics-orders-soft)",
  average_order_value: "var(--analytics-average-order-value-soft)",
  margin: "var(--analytics-margin-soft)",
  repeat_customer_rate: "var(--analytics-repeat-customer-rate-soft)",
  products: "var(--analytics-products-soft)",
  customers: "var(--analytics-customers-soft)",
  collections: "var(--analytics-collections-soft)",
  packages: "var(--analytics-packages-soft)",
  production: "var(--analytics-production-soft)",
  operations: "var(--analytics-operations-soft)",
};

type AnalyticsChartEmptyStateProps = {
  title: string;
  description?: string;
  category?: AnalyticsVisualCategory;
  icon?: LucideIcon;
};

export function AnalyticsChartEmptyState({
  title,
  description,
  category,
  icon: Icon = BarChart2,
}: AnalyticsChartEmptyStateProps) {
  const colors = category
    ? {
        accent: ANALYTICS_CATEGORY_ACCENT_VAR[category],
        soft: CATEGORY_SOFT_VAR[category],
      }
    : null;

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background/50 px-6 py-14 text-center">
      <div
        className="mb-4 rounded-full p-3.5"
        style={{
          backgroundColor: colors?.soft ?? "var(--surface-hover)",
        }}
      >
        <Icon
          className="h-6 w-6"
          style={{ color: colors?.accent ?? "var(--text-muted)" }}
          strokeWidth={1.5}
        />
      </div>
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md whitespace-pre-line text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      ) : null}
    </div>
  );
}
