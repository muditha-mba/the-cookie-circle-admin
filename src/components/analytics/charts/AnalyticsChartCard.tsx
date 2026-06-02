"use client";

import type { ReactNode } from "react";

import type { AnalyticsVisualCategory } from "@/components/analytics/analytics-categories";
import { cn } from "@/lib/utils";

type AnalyticsChartCardProps = {
  title: string;
  description?: string;
  category?: AnalyticsVisualCategory;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

const CATEGORY_ACCENT_VAR: Record<AnalyticsVisualCategory, string> = {
  revenue: "var(--analytics-revenue)",
  profit: "var(--analytics-profit)",
  orders: "var(--analytics-orders)",
  average_order_value: "var(--analytics-average-order-value)",
  margin: "var(--analytics-margin)",
  repeat_customer_rate: "var(--analytics-repeat-customer-rate)",
  products: "var(--analytics-products)",
  customers: "var(--analytics-customers)",
  collections: "var(--analytics-collections)",
  production: "var(--analytics-production)",
  operations: "var(--analytics-operations)",
};

const CATEGORY_PANEL_CLASS: Record<AnalyticsVisualCategory, string> = {
  revenue: "from-[var(--analytics-revenue-soft)]",
  profit: "from-[var(--analytics-profit-soft)]",
  orders: "from-[var(--analytics-orders-soft)]",
  average_order_value: "from-[var(--analytics-average-order-value-soft)]",
  margin: "from-[var(--analytics-margin-soft)]",
  repeat_customer_rate: "from-[var(--analytics-repeat-customer-rate-soft)]",
  products: "from-[var(--analytics-products-soft)]",
  customers: "from-[var(--analytics-customers-soft)]",
  collections: "from-[var(--analytics-collections-soft)]",
  production: "from-[var(--analytics-production-soft)]",
  operations: "from-[var(--analytics-operations-soft)]",
};

/** Standard card shell for analytics visualizations. */
export function AnalyticsChartCard({
  title,
  description,
  category,
  actions,
  children,
  className,
}: AnalyticsChartCardProps) {
  const tintClass = category ? CATEGORY_PANEL_CLASS[category] : null;
  const accentVar = category ? CATEGORY_ACCENT_VAR[category] : undefined;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-sm",
        className,
      )}
    >
      <div
        className={cn(
          "border-b border-border/70 bg-gradient-to-b to-transparent px-5 pb-4 pt-5",
          tintClass ?? "from-transparent",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              {accentVar ? (
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: accentVar }}
                  aria-hidden
                />
              ) : null}
              <h2 className="text-base font-semibold tracking-tight text-text-primary">
                {title}
              </h2>
            </div>
            {description ? (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-text-secondary">
                {description}
              </p>
            ) : null}
          </div>
          {actions}
        </div>
      </div>
      <div className="bg-background/30 px-5 py-5">{children}</div>
    </section>
  );
}
