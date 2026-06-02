"use client";

import { memo, useCallback, useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { resolveSeriesChartColors } from "@/components/analytics/analytics-categories";

import { AnalyticsChartContainer } from "./AnalyticsChartContainer";
import { AnalyticsChartLegend } from "./AnalyticsChartLegend";
import { AnalyticsChartTooltip } from "./AnalyticsChartTooltip";
import { useAnalyticsChartTheme } from "./theme";
import type { AnalyticsSeriesChartProps } from "./types";
import {
  CHART_MARGIN,
  DEFAULT_CHART_HEIGHT,
  hasSeriesChartData,
  tooltipNumericValue,
} from "./utils";

export const AnalyticsAreaChart = memo(function AnalyticsAreaChart({
  data,
  formatValue = (value) => value.toLocaleString("en-LK"),
  valueLabel = "Value",
  height = DEFAULT_CHART_HEIGHT,
  color,
  category,
  showLegend = false,
  isLoading,
  isError,
  errorMessage,
  emptyTitle,
  emptyDescription,
}: AnalyticsSeriesChartProps) {
  const theme = useAnalyticsChartTheme();
  const { stroke, tooltipAccent } = resolveSeriesChartColors(category, theme.primary, color);
  const hasData = useMemo(() => hasSeriesChartData(data), [data]);

  const tickFormatter = useCallback(
    (value: number) => formatValue(value),
    [formatValue],
  );

  const gradientId = useId().replace(/:/g, "");

  return (
    <AnalyticsChartContainer
      hasData={hasData}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      height={height}
      category={category}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={theme.grid} strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: theme.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: theme.grid }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: theme.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={tickFormatter}
            width={72}
          />
          <Tooltip
            content={({ active, payload, label }) => (
              <AnalyticsChartTooltip
                active={active}
                value={tooltipNumericValue(payload?.[0]?.value)}
                label={label}
                theme={theme}
                formatValue={formatValue}
                valueLabel={valueLabel}
                accentColor={tooltipAccent}
              />
            )}
            cursor={{ stroke: stroke, strokeOpacity: 0.2, strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name={valueLabel}
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={{ r: 3, fill: stroke, strokeWidth: 2, stroke: theme.tooltipBackground }}
            activeDot={{ r: 4, fill: stroke }}
          />
          {showLegend ? (
            <Legend
              verticalAlign="bottom"
              content={(props) => <AnalyticsChartLegend {...props} theme={theme} />}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </AnalyticsChartContainer>
  );
});
