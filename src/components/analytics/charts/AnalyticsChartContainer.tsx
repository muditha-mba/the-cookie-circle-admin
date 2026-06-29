"use client";

import { memo } from "react";

import { cn } from "@/lib/utils";

import { AnalyticsChartEmptyState } from "./AnalyticsChartEmptyState";
import type { AnalyticsChartContainerProps } from "./types";
import { DEFAULT_CHART_HEIGHT } from "./utils";

export const AnalyticsChartContainer = memo(function AnalyticsChartContainer({
  children,
  hasData,
  isLoading = false,
  isError = false,
  errorMessage = "Unable to load chart data.",
  emptyTitle = "No data for this period",
  emptyDescription = "Data will appear here once activity exists in the selected range.",
  height = DEFAULT_CHART_HEIGHT,
  className,
  category,
}: AnalyticsChartContainerProps) {
  if (isLoading) {
    return (
      <div
        className={cn("w-full animate-pulse rounded-lg bg-surface-hover", className)}
        style={{ height }}
        aria-busy
        aria-label="Loading chart"
      />
    );
  }

  if (isError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-danger/30 bg-danger/5 px-4 text-center text-sm text-danger",
          className,
        )}
        style={{ height }}
      >
        {errorMessage}
      </div>
    );
  }

  if (!hasData) {
    return (
      <AnalyticsChartEmptyState
        title={emptyTitle}
        description={emptyDescription}
        category={category}
      />
    );
  }

  return (
    <div className={cn("w-full min-w-0", className)} style={{ height }}>
      {children}
    </div>
  );
});
