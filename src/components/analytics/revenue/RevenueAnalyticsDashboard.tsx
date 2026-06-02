"use client";

import { useQueries } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { AnalyticsDateRangeControls } from "@/components/analytics/AnalyticsDateRangeControls";
import { AnalyticsGranularityToggle } from "@/components/analytics/AnalyticsGranularityToggle";
import { AnalyticsKpiCard, AnalyticsKpiGridSkeleton } from "@/components/analytics/AnalyticsKpiCard";
import {
  AnalyticsChartCard,
  AnalyticsLineChart,
  toAnalyticsChartData,
  type AnalyticsChartPoint,
} from "@/components/analytics/charts";
import { SectionCard } from "@/components/production/shared";
import { DataTable } from "@/components/data/DataTable";
import { routes } from "@/config/routes";
import {
  analyticsApi,
  analyticsQueryKey,
  buildAnalyticsQueryParams,
  type AnalyticsDatePreset,
  type AnalyticsQueryParams,
  type TopProfitableOrder,
  type TrendGranularity,
} from "@/lib/api/analytics";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";

function formatRangeLabel(start: string, end: string) {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function toChartPoints(
  points: { period_start: string; revenue: string; profit: string; order_count: number }[],
  field: "revenue" | "profit" | "order_count",
): AnalyticsChartPoint[] {
  return points.map((point) => ({
    periodStart: point.period_start,
    value:
      field === "order_count"
        ? point.order_count
        : Number(point[field]) || 0,
  }));
}

const topOrderColumns: ColumnDef<TopProfitableOrder>[] = [
  {
    header: "Order",
    accessorKey: "order_number",
    cell: ({ row }) => (
      <Link
        href={routes.orders.detail(row.original.order_id)}
        className="font-medium text-primary hover:underline"
        onClick={(event) => event.stopPropagation()}
      >
        {row.original.order_number}
      </Link>
    ),
  },
  {
    header: "Customer",
    accessorKey: "customer_name",
    cell: ({ row }) => (
      <span className="text-text-primary">{row.original.customer_name}</span>
    ),
  },
  {
    header: "Revenue",
    accessorKey: "total_revenue_snapshot",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCurrency(row.original.total_revenue_snapshot)}</span>
    ),
  },
  {
    header: "Profit",
    accessorKey: "total_profit_snapshot",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCurrency(row.original.total_profit_snapshot)}</span>
    ),
  },
  {
    header: "Margin",
    accessorKey: "margin_percentage_snapshot",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatPercent(row.original.margin_percentage_snapshot)}
      </span>
    ),
  },
  {
    header: "Delivery",
    accessorKey: "scheduled_delivery_date",
    cell: ({ row }) => formatDate(row.original.scheduled_delivery_date),
  },
];

export function RevenueAnalyticsDashboard() {
  const [preset, setPreset] = useState<AnalyticsDatePreset>("last_30_days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [granularity, setGranularity] = useState<TrendGranularity>("day");

  const queryParams = useMemo((): AnalyticsQueryParams | null => {
    if (preset === "custom" && (!customStart || !customEnd)) {
      return null;
    }
    return buildAnalyticsQueryParams(preset, customStart, customEnd, granularity, 10);
  }, [preset, customStart, customEnd, granularity]);

  const enabled = queryParams !== null;

  const [kpisQuery, trendsQuery, topOrdersQuery] = useQueries({
    queries: [
      {
        queryKey: analyticsQueryKey("revenue-kpis", queryParams ?? {}),
        queryFn: () => analyticsApi.getKpis(queryParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("revenue-trends", queryParams ?? {}),
        queryFn: () => analyticsApi.getRevenueTrends(queryParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("revenue-top-orders", queryParams ?? {}),
        queryFn: () => analyticsApi.getTopProfitableOrders(queryParams!),
        enabled,
      },
    ],
  });

  const kpis = kpisQuery.data;
  const trends = trendsQuery.data;
  const topOrders = topOrdersQuery.data;

  const rangeLabel = kpis
    ? formatRangeLabel(kpis.date_range.start_date, kpis.date_range.end_date)
    : undefined;

  const resolvedRange = trends?.date_range ?? kpis?.date_range;

  const isLoading = enabled && (kpisQuery.isLoading || trendsQuery.isLoading);
  const hasQueryError =
    kpisQuery.isError || trendsQuery.isError || topOrdersQuery.isError;
  const trendsError = trendsQuery.isError;

  const chartGranularity = trends?.granularity ?? granularity;

  const revenueChartData = useMemo(
    () =>
      toAnalyticsChartData(
        trends ? toChartPoints(trends.points, "revenue") : [],
        chartGranularity,
      ),
    [trends, chartGranularity],
  );

  const profitChartData = useMemo(
    () =>
      toAnalyticsChartData(
        trends ? toChartPoints(trends.points, "profit") : [],
        chartGranularity,
      ),
    [trends, chartGranularity],
  );

  const ordersChartData = useMemo(
    () =>
      toAnalyticsChartData(
        trends ? toChartPoints(trends.points, "order_count") : [],
        chartGranularity,
      ),
    [trends, chartGranularity],
  );

  const formatCurrencyValue = useCallback(
    (value: number) => formatCurrency(value),
    [],
  );

  const formatOrderCount = useCallback(
    (value: number) => value.toLocaleString("en-LK"),
    [],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Link
          href={routes.analytics.home}
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Analytics
        </Link>
        <AnalyticsGranularityToggle value={granularity} onChange={setGranularity} />
      </div>

      <AnalyticsDateRangeControls
        preset={preset}
        customStart={customStart}
        customEnd={customEnd}
        onPresetChange={setPreset}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
        resolvedRange={resolvedRange}
      />

      {!enabled ? (
        <p className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-sm text-text-secondary">
          Choose a start and end date to load the revenue dashboard.
        </p>
      ) : null}

      {hasQueryError ? (
        <div className="rounded-lg border border-danger/40 bg-surface px-4 py-3 text-sm text-danger">
          Unable to load analytics data. Check your connection and try again.
        </div>
      ) : null}

      {enabled ? (
        <>
          {isLoading && !kpis ? (
            <AnalyticsKpiGridSkeleton />
          ) : kpis ? (
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AnalyticsKpiCard
                variant="revenue"
                label="Total revenue"
                value={formatCurrency(kpis.total_revenue)}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="profit"
                label="Total profit"
                value={formatCurrency(kpis.total_profit)}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="orders"
                label="Total orders"
                value={kpis.total_orders}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="average_order_value"
                label="Average order value"
                value={formatCurrency(kpis.average_order_value)}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="margin"
                label="Profit margin"
                value={formatPercent(kpis.profit_margin_percentage)}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="repeat_customer_rate"
                label="Repeat customer rate"
                value={formatPercent(kpis.repeat_customer_rate)}
                dateRangeLabel={rangeLabel}
              />
            </dl>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-1">
            <AnalyticsChartCard
              category="revenue"
              title="Revenue over time"
              description="Gross revenue from order financial snapshots."
            >
              <AnalyticsLineChart
                category="revenue"
                data={revenueChartData}
                formatValue={formatCurrencyValue}
                valueLabel="Revenue"
                isLoading={trendsQuery.isLoading}
                isError={trendsError}
                emptyTitle="No revenue in this period"
                emptyDescription="Revenue from confirmed orders will appear once you have activity in the selected date range."
              />
            </AnalyticsChartCard>

            <AnalyticsChartCard
              category="profit"
              title="Profit over time"
              description="Net profit captured at order placement."
            >
              <AnalyticsLineChart
                category="profit"
                data={profitChartData}
                formatValue={formatCurrencyValue}
                valueLabel="Profit"
                isLoading={trendsQuery.isLoading}
                isError={trendsError}
                emptyTitle="No profit data in this period"
                emptyDescription="Profit trends use immutable order snapshots and update as orders are placed."
              />
            </AnalyticsChartCard>

            <AnalyticsChartCard
              category="orders"
              title="Orders over time"
              description="Order volume excluding drafts and cancellations."
            >
              <AnalyticsLineChart
                category="orders"
                data={ordersChartData}
                formatValue={formatOrderCount}
                valueLabel="Orders"
                isLoading={trendsQuery.isLoading}
                isError={trendsError}
                emptyTitle="No orders in this period"
                emptyDescription="Order counts will chart here when orders exist in the selected range."
              />
            </AnalyticsChartCard>
          </div>

          <SectionCard
            title="Top profitable orders"
            description="Highest profit orders in the selected period (snapshot values)."
          >
            {topOrdersQuery.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-12 animate-pulse rounded-md bg-surface-hover"
                  />
                ))}
              </div>
            ) : topOrders && topOrders.items.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-text-secondary">
                No orders in this period yet. As your business grows, top performers will
                appear here.
              </p>
            ) : (
              <DataTable
                columns={topOrderColumns}
                data={topOrders?.items ?? []}
                emptyMessage="No orders in this period."
              />
            )}
          </SectionCard>
        </>
      ) : null}
    </div>
  );
}
