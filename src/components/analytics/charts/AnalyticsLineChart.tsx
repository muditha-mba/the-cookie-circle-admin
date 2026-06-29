"use client";

import { memo, useCallback, useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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

export const AnalyticsLineChart = memo(function AnalyticsLineChart({
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
        <LineChart data={data} margin={CHART_MARGIN}>
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
          <Line
            type="monotone"
            dataKey="value"
            name={valueLabel}
            stroke={stroke}
            strokeWidth={2}
            dot={{ r: 3, fill: stroke, strokeWidth: 2, stroke: theme.tooltipBackground }}
            activeDot={{ r: 4, fill: stroke }}
          />
          {showLegend ? (
            <Legend
              verticalAlign="bottom"
              content={(props) => <AnalyticsChartLegend {...props} theme={theme} />}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </AnalyticsChartContainer>
  );
});
