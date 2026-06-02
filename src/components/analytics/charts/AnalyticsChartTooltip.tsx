"use client";

import type { AnalyticsChartTheme } from "./theme";

type AnalyticsChartTooltipProps = {
  active?: boolean;
  label?: string | number;
  value?: number | string | null;
  theme: AnalyticsChartTheme;
  formatValue: (value: number) => string;
  valueLabel?: string;
  accentColor?: string;
};

export function AnalyticsChartTooltip({
  active,
  label,
  value,
  theme,
  formatValue,
  valueLabel = "Value",
  accentColor,
}: AnalyticsChartTooltipProps) {
  if (!active || value == null) {
    return null;
  }

  const numericValue = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(numericValue)) {
    return null;
  }

  const displayLabel = label != null ? String(label) : undefined;
  const indicator = accentColor ?? theme.primary;

  return (
    <div
      className="min-w-[140px] rounded-lg border px-3.5 py-2.5 shadow-md"
      style={{
        backgroundColor: theme.tooltipBackground,
        borderColor: theme.tooltipBorder,
        color: theme.tooltipText,
      }}
    >
      {displayLabel ? (
        <div className="mb-2 flex items-center gap-2 border-b border-border/60 pb-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: indicator }}
            aria-hidden
          />
          <p className="text-xs font-medium text-text-primary">{displayLabel}</p>
        </div>
      ) : null}
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-xs text-text-secondary">{valueLabel}</span>
        <span className="text-sm font-semibold tabular-nums text-text-primary">
          {formatValue(numericValue)}
        </span>
      </div>
    </div>
  );
}
