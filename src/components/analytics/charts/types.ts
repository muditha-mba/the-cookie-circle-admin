import type { ReactNode } from "react";

import type { AnalyticsVisualCategory } from "@/components/analytics/analytics-categories";
import type { TrendGranularity } from "@/lib/api/analytics";

/** Single-series point for line, area, and bar charts. */
export type AnalyticsChartDatum = {
  label: string;
  value: number;
};

/** Segment for donut and comparative charts. */
export type AnalyticsDonutDatum = {
  name: string;
  value: number;
  color?: string;
};

export type AnalyticsChartPoint = {
  periodStart: string;
  value: number;
};

export type AnalyticsChartStateProps = {
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export type AnalyticsChartContainerProps = AnalyticsChartStateProps & {
  children: ReactNode;
  hasData: boolean;
  height?: number;
  className?: string;
  category?: AnalyticsVisualCategory;
};

export type AnalyticsSeriesChartProps = AnalyticsChartStateProps & {
  data: AnalyticsChartDatum[];
  formatValue?: (value: number) => string;
  valueLabel?: string;
  height?: number;
  color?: string;
  category?: AnalyticsVisualCategory;
  showLegend?: boolean;
  granularity?: TrendGranularity;
  layout?: "vertical" | "horizontal";
};

export type AnalyticsDonutChartProps = AnalyticsChartStateProps & {
  data: AnalyticsDonutDatum[];
  formatValue?: (value: number) => string;
  height?: number;
  innerRadius?: number | string;
  category?: AnalyticsVisualCategory;
  showLegend?: boolean;
};
