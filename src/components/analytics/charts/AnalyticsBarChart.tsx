"use client";

import { memo, useCallback, useMemo } from "react";
import {
  Bar,
  BarChart,
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

const HORIZONTAL_MARGIN = { top: 8, right: 16, left: 8, bottom: 8 };

export const AnalyticsBarChart = memo(function AnalyticsBarChart({
  data,
  formatValue = (value) => value.toLocaleString("en-LK"),
  valueLabel = "Value",
  height = DEFAULT_CHART_HEIGHT,
  color,
  category,
  showLegend = false,
  layout = "vertical",
  isLoading,
  isError,
  errorMessage,
  emptyTitle,
  emptyDescription,
}: AnalyticsSeriesChartProps) {
  const theme = useAnalyticsChartTheme();
  const { stroke: fill, tooltipAccent } = resolveSeriesChartColors(
    category,
    theme.primary,
    color,
  );
  const hasData = useMemo(() => hasSeriesChartData(data), [data]);
  const isHorizontal = layout === "horizontal";

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
        <BarChart
          data={data}
          layout={isHorizontal ? "vertical" : "horizontal"}
          margin={isHorizontal ? HORIZONTAL_MARGIN : CHART_MARGIN}
        >
          <CartesianGrid stroke={theme.grid} strokeDasharray="4 4" vertical={false} />
          {isHorizontal ? (
            <>
              <XAxis
                type="number"
                tick={{ fill: theme.axis, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: theme.grid }}
                tickFormatter={tickFormatter}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: theme.axis, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={96}
              />
              <Bar
                dataKey="value"
                name={valueLabel}
                fill={fill}
                radius={[0, 4, 4, 0]}
                maxBarSize={32}
              />
            </>
          ) : (
            <>
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
              <Bar
                dataKey="value"
                name={valueLabel}
                fill={fill}
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </>
          )}
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
            cursor={{ fill, fillOpacity: 0.12 }}
          />
          {showLegend ? (
            <Legend
              verticalAlign="bottom"
              content={(props) => <AnalyticsChartLegend {...props} theme={theme} />}
            />
          ) : null}
        </BarChart>
      </ResponsiveContainer>
    </AnalyticsChartContainer>
  );
});
