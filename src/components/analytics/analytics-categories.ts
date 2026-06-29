"use client";

import {
  DollarSign,
  Factory,
  Gauge,
  Layers,
  Package,
  Percent,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";
import { useTheme } from "next-themes";

/**
 * Visual categories for analytics KPIs, charts, and tooltips.
 * Maps to CSS variables in globals.css (light/dark aware).
 */
export type AnalyticsVisualCategory =
  | "revenue"
  | "profit"
  | "orders"
  | "average_order_value"
  | "margin"
  | "repeat_customer_rate"
  | "products"
  | "customers"
  | "collections"
  | "packages"
  | "production"
  | "operations";

export type AnalyticsKpiVariant = Extract<
  AnalyticsVisualCategory,
  | "revenue"
  | "profit"
  | "orders"
  | "average_order_value"
  | "margin"
  | "repeat_customer_rate"
  | "products"
  | "customers"
  | "collections"
  | "packages"
  | "production"
  | "operations"
>;

/** KPI cards on customer analytics dashboards use the teal customer accent. */
export type CustomerAnalyticsKpiVariant = Extract<AnalyticsVisualCategory, "customers">;

export const ANALYTICS_CATEGORY_ACCENT_VAR: Record<AnalyticsVisualCategory, string> = {
  revenue: "var(--analytics-revenue)",
  profit: "var(--analytics-profit)",
  orders: "var(--analytics-orders)",
  average_order_value: "var(--analytics-average-order-value)",
  margin: "var(--analytics-margin)",
  repeat_customer_rate: "var(--analytics-repeat-customer-rate)",
  products: "var(--analytics-products)",
  customers: "var(--analytics-customers)",
  collections: "var(--analytics-collections)",
  packages: "var(--analytics-packages)",
  production: "var(--analytics-production)",
  operations: "var(--analytics-operations)",
};

const CSS_VAR_MAP: Record<AnalyticsVisualCategory, string> = {
  revenue: "--analytics-revenue",
  profit: "--analytics-profit",
  orders: "--analytics-orders",
  average_order_value: "--analytics-average-order-value",
  margin: "--analytics-margin",
  repeat_customer_rate: "--analytics-repeat-customer-rate",
  products: "--analytics-products",
  customers: "--analytics-customers",
  collections: "--analytics-collections",
  packages: "--analytics-packages",
  production: "--analytics-production",
  operations: "--analytics-operations",
};

const FALLBACK_ACCENT: Record<AnalyticsVisualCategory, string> = {
  revenue: "#a16207",
  profit: "#059669",
  orders: "#4338ca",
  average_order_value: "#7c3aed",
  margin: "#d97706",
  repeat_customer_rate: "#0d9488",
  products: "#7c3aed",
  customers: "#0d9488",
  collections: "#0891b2",
  packages: "#7c3aed",
  production: "#ea580c",
  operations: "#334155",
};

export const KPI_VARIANT_ICONS: Record<AnalyticsKpiVariant, LucideIcon> = {
  revenue: DollarSign,
  profit: TrendingUp,
  orders: ShoppingCart,
  average_order_value: Receipt,
  margin: Percent,
  repeat_customer_rate: Users,
  products: Package,
  customers: Users,
  collections: Layers,
  packages: Layers,
  production: Factory,
  operations: Gauge,
};

export const CUSTOMER_ANALYTICS_KPI_VARIANT: CustomerAnalyticsKpiVariant = "customers";

function readCssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export type AnalyticsCategoryAccent = {
  accent: string;
  soft: string;
  cssVar: string;
  softCssVar: string;
};

export function useAnalyticsCategoryAccent(
  category: AnalyticsVisualCategory,
): AnalyticsCategoryAccent {
  const { resolvedTheme } = useTheme();
  const cssVar = CSS_VAR_MAP[category];
  const softCssVar = `${cssVar}-soft`;

  return useMemo(
    () => ({
      cssVar,
      softCssVar,
      accent: readCssVar(cssVar, FALLBACK_ACCENT[category]),
      soft: readCssVar(softCssVar, `${FALLBACK_ACCENT[category]}1a`),
    }),
    [category, cssVar, softCssVar, resolvedTheme],
  );
}

export function getCategoryChartColor(
  category: AnalyticsVisualCategory | undefined,
  themePrimary: string,
  explicitColor?: string,
): string {
  if (explicitColor) {
    return explicitColor;
  }
  if (!category) {
    return themePrimary;
  }
  if (typeof window === "undefined") {
    return FALLBACK_ACCENT[category];
  }
  return readCssVar(CSS_VAR_MAP[category], FALLBACK_ACCENT[category]);
}

export function resolveSeriesChartColors(
  category: AnalyticsVisualCategory | undefined,
  themePrimary: string,
  explicitColor?: string,
) {
  const stroke = getCategoryChartColor(category, themePrimary, explicitColor);
  const tooltipAccent = category ? ANALYTICS_CATEGORY_ACCENT_VAR[category] : stroke;
  return { stroke, tooltipAccent };
}
