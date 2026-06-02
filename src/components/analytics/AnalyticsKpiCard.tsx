"use client";

import { Minus } from "lucide-react";
import type { ReactNode } from "react";

import {
  KPI_VARIANT_ICONS,
  useAnalyticsCategoryAccent,
  type AnalyticsKpiVariant,
} from "@/components/analytics/analytics-categories";
import { cn } from "@/lib/utils";

type AnalyticsKpiCardProps = {
  label: string;
  value: ReactNode;
  variant: AnalyticsKpiVariant;
  dateRangeLabel?: string;
  trendPercentage?: string | number | null;
  trendDirection?: "up" | "down" | "flat" | string | null;
  trendComparisonLabel?: string;
  isLoading?: boolean;
  className?: string;
};

export function AnalyticsKpiCard({
  label,
  value,
  variant,
  dateRangeLabel,
  trendPercentage,
  trendDirection,
  trendComparisonLabel = "vs previous period",
  isLoading = false,
  className,
}: AnalyticsKpiCardProps) {
  const { accent, soft } = useAnalyticsCategoryAccent(variant);
  const Icon = KPI_VARIANT_ICONS[variant];

  const hasTrend = trendPercentage !== null && trendPercentage !== undefined && trendDirection;
  const trendGlyph =
    trendDirection === "up" ? "↑" : trendDirection === "down" ? "↓" : trendDirection === "flat" ? "→" : null;
  const trendText = hasTrend ? `${trendGlyph} ${trendPercentage}% ${trendComparisonLabel}` : "Trend —";

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-xl border border-border",
        "bg-surface-elevated shadow-sm",
        className,
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-0.5"
        style={{ backgroundColor: accent }}
        aria-hidden
      />

      <div className="flex flex-1 flex-col px-5 py-4 pl-6">
        <div className="flex items-start gap-3">
          <div
            className="rounded-lg p-2"
            style={{ backgroundColor: soft }}
            aria-hidden
          >
            <Icon className="h-4 w-4" style={{ color: accent }} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              {label}
            </p>
            {isLoading ? (
              <div className="mt-3 h-8 w-28 animate-pulse rounded-md bg-surface-hover" />
            ) : (
              <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-text-primary">
                {value}
              </p>
            )}
            {dateRangeLabel ? (
              <p className="mt-1 text-xs text-text-muted">{dateRangeLabel}</p>
            ) : null}
          </div>
        </div>

        <div
          className="mt-4 flex items-center gap-1.5 border-t border-border/60 pt-3 text-xs"
          style={{ color: accent }}
          aria-hidden
          title={hasTrend ? "Period-over-period trend" : "Period-over-period trends will appear in a future release"}
        >
          {hasTrend ? <span className="opacity-90">{trendText}</span> : (
            <>
              <Minus className="h-3 w-3 shrink-0 opacity-70" />
              <span className="opacity-80">Trend —</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

const REVENUE_KPI_SKELETON_VARIANTS: AnalyticsKpiVariant[] = [
  "revenue",
  "profit",
  "orders",
  "average_order_value",
  "margin",
  "repeat_customer_rate",
];

const PRODUCT_KPI_SKELETON_VARIANTS: AnalyticsKpiVariant[] = [
  "products",
  "products",
  "customers",
  "customers",
  "products",
  "customers",
];

const CUSTOMER_KPI_SKELETON_VARIANTS: AnalyticsKpiVariant[] = [
  "customers",
  "customers",
  "customers",
  "customers",
  "customers",
  "customers",
];

const PRODUCTION_KPI_SKELETON_VARIANTS: AnalyticsKpiVariant[] = [
  "production",
  "production",
  "production",
  "production",
  "production",
  "production",
];

const ORDER_KPI_SKELETON_VARIANTS: AnalyticsKpiVariant[] = [
  "orders",
  "orders",
  "orders",
  "orders",
  "orders",
  "orders",
];

const OPERATIONS_KPI_SKELETON_VARIANTS: AnalyticsKpiVariant[] = [
  "revenue",
  "profit",
  "orders",
  "operations",
  "customers",
  "production",
];

const COLLECTION_KPI_SKELETON_VARIANTS: AnalyticsKpiVariant[] = [
  "collections",
  "collections",
  "collections",
  "collections",
  "collections",
  "collections",
];

type AnalyticsKpiGridSkeletonProps = {
  /** Which dashboard skeleton layout to show. Defaults to revenue. */
  layout?:
    | "revenue"
    | "product"
    | "customer"
    | "production"
    | "collection"
    | "order"
    | "operations";
};

export function AnalyticsKpiGridSkeleton({
  layout = "revenue",
}: AnalyticsKpiGridSkeletonProps) {
  const variants =
    layout === "product"
      ? PRODUCT_KPI_SKELETON_VARIANTS
      : layout === "customer"
        ? CUSTOMER_KPI_SKELETON_VARIANTS
        : layout === "production"
          ? PRODUCTION_KPI_SKELETON_VARIANTS
          : layout === "collection"
            ? COLLECTION_KPI_SKELETON_VARIANTS
            : layout === "order"
              ? ORDER_KPI_SKELETON_VARIANTS
              : layout === "operations"
                ? OPERATIONS_KPI_SKELETON_VARIANTS
                : REVENUE_KPI_SKELETON_VARIANTS;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {variants.map((variant, index) => (
        <AnalyticsKpiCard
          key={`${variant}-${index}`}
          variant={variant}
          label="Loading"
          value=""
          isLoading
        />
      ))}
    </div>
  );
}
