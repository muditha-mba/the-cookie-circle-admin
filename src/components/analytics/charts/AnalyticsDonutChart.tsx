"use client";

import { memo, useMemo } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { resolveSeriesChartColors } from "@/components/analytics/analytics-categories";

import { AnalyticsChartContainer } from "./AnalyticsChartContainer";
import { AnalyticsChartLegend } from "./AnalyticsChartLegend";
import { AnalyticsChartTooltip } from "./AnalyticsChartTooltip";
import { useAnalyticsChartTheme } from "./theme";
import type { AnalyticsDonutChartProps } from "./types";
import { DEFAULT_CHART_HEIGHT, hasDonutChartData, tooltipNumericValue } from "./utils";

export const AnalyticsDonutChart = memo(function AnalyticsDonutChart({
  data,
  formatValue = (value) => value.toLocaleString("en-LK"),
  height = DEFAULT_CHART_HEIGHT,
  innerRadius = "62%",
  category,
  showLegend = true,
  isLoading,
  isError,
  errorMessage,
  emptyTitle,
  emptyDescription,
}: AnalyticsDonutChartProps) {
  const theme = useAnalyticsChartTheme();
  const { tooltipAccent } = resolveSeriesChartColors(category, theme.primary);
  const hasData = useMemo(() => hasDonutChartData(data), [data]);

  const coloredData = useMemo(
    () =>
      data.map((segment, index) => ({
        ...segment,
        color: segment.color ?? theme.palette[index % theme.palette.length],
      })),
    [data, theme.palette],
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
        <PieChart>
          <Tooltip
            content={({ active, payload, label }) => (
              <AnalyticsChartTooltip
                active={active}
                value={tooltipNumericValue(payload?.[0]?.value)}
                label={label ?? payload?.[0]?.name}
                theme={theme}
                formatValue={formatValue}
                valueLabel="Amount"
                accentColor={tooltipAccent}
              />
            )}
          />
          <Pie
            data={coloredData}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius="88%"
            paddingAngle={2}
            stroke={theme.tooltipBackground}
            strokeWidth={2}
          >
            {coloredData.map((segment) => (
              <Cell key={segment.name} fill={segment.color} />
            ))}
          </Pie>
          {showLegend ? (
            <Legend
              verticalAlign="bottom"
              content={(props) => <AnalyticsChartLegend {...props} theme={theme} />}
            />
          ) : null}
        </PieChart>
      </ResponsiveContainer>
    </AnalyticsChartContainer>
  );
});
