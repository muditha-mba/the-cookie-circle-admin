"use client";

import type { AnalyticsChartTheme } from "./theme";

type LegendEntry = {
  value?: string;
  color?: string;
};

type AnalyticsChartLegendProps = {
  payload?: readonly LegendEntry[];
  theme: AnalyticsChartTheme;
};

export function AnalyticsChartLegend({ payload, theme }: AnalyticsChartLegendProps) {
  if (!payload?.length) {
    return null;
  }

  return (
    <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
      {payload.map((entry) => (
        <li key={String(entry.value)} className="flex items-center gap-1.5 text-text-secondary">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color ?? theme.primary }}
          />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}
