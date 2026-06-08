import type { TrendGranularity } from "@/lib/api/analytics";
import { formatDate } from "@/lib/format";

import type { AnalyticsChartDatum, AnalyticsChartPoint } from "./types";

export function formatPeriodLabel(
  periodStart: string,
  granularity: TrendGranularity,
): string {
  const date = new Date(`${periodStart}T12:00:00`);
  if (granularity === "month") {
    return new Intl.DateTimeFormat("en-LK", { month: "short", year: "2-digit" }).format(
      date,
    );
  }
  if (granularity === "week") {
    return new Intl.DateTimeFormat("en-LK", { month: "short", day: "numeric" }).format(
      date,
    );
  }
  return formatDate(periodStart);
}

export function hasSeriesChartData(data: AnalyticsChartDatum[]): boolean {
  return data.some((point) => point.value > 0);
}

export function hasDonutChartData(data: { value: number }[]): boolean {
  return data.some((segment) => segment.value > 0);
}

export function toAnalyticsChartData(
  points: AnalyticsChartPoint[],
  granularity: TrendGranularity,
): AnalyticsChartDatum[] {
  return points.map((point) => ({
    label: formatPeriodLabel(point.periodStart, granularity),
    value: point.value,
  }));
}

export const DEFAULT_CHART_HEIGHT = 280;

export const CHART_MARGIN = { top: 8, right: 8, left: 0, bottom: 0 };

/** Normalizes Recharts tooltip payload values for display. */
export function tooltipNumericValue(raw: unknown): number | string | null {
  if (raw == null) {
    return null;
  }
  if (typeof raw === "number" || typeof raw === "string") {
    return raw;
  }
  return null;
}
