"use client";

import { useQueries } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { AnalyticsDateRangeControls } from "@/components/analytics/AnalyticsDateRangeControls";
import { AnalyticsGranularityToggle } from "@/components/analytics/AnalyticsGranularityToggle";
import { AnalyticsInsightCard } from "@/components/analytics/AnalyticsInsightCard";
import { AnalyticsKpiCard, AnalyticsKpiGridSkeleton } from "@/components/analytics/AnalyticsKpiCard";
import { AnalyticsSortableTable } from "@/components/analytics/AnalyticsSortableTable";
import {
  AnalyticsAreaChart,
  AnalyticsBarChart,
  AnalyticsChartCard,
  AnalyticsDonutChart,
  AnalyticsLineChart,
  toAnalyticsChartData,
  type AnalyticsChartDatum,
  type AnalyticsChartPoint,
  type AnalyticsDonutDatum,
} from "@/components/analytics/charts";
import { routes } from "@/config/routes";
import {
  analyticsApi,
  analyticsQueryKey,
  buildAnalyticsQueryParams,
  type AnalyticsDatePreset,
  type AnalyticsQueryParams,
  type OrderAnalyticsPerformanceRow,
  type OrderDistributionItem,
  type TrendGranularity,
} from "@/lib/api/analytics";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";

const CHART_LIMIT = 10;
const TABLE_LIMIT = 100;

function formatRangeLabel(start: string, end: string) {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function formatEnumLabel(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function truncateLabel(name: string, maxLength = 20): string {
  if (name.length <= maxLength) {
    return name;
  }
  return `${name.slice(0, maxLength - 1)}…`;
}

function toDonutData(items: OrderDistributionItem[]): AnalyticsDonutDatum[] {
  return items
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: item.label,
      value: item.count,
    }));
}

function toBarData(items: OrderDistributionItem[]): AnalyticsChartDatum[] {
  return items
    .filter((item) => item.count > 0)
    .map((item) => ({
      label: truncateLabel(item.label),
      value: item.count,
    }));
}

function toTrendPoints(
  points: { period_start: string; count: number }[],
): AnalyticsChartPoint[] {
  return points.map((point) => ({
    periodStart: point.period_start,
    value: point.count,
  }));
}

const performanceColumns: ColumnDef<OrderAnalyticsPerformanceRow>[] = [
  {
    accessorKey: "order_number",
    header: "Order number",
    cell: ({ row }) => (
      <Link
        href={routes.orders.detail(row.original.order_id)}
        className="font-medium text-primary hover:underline"
      >
        {row.original.order_number}
      </Link>
    ),
  },
  {
    accessorKey: "customer_name",
    header: "Customer",
    cell: ({ row }) => (
      <Link
        href={routes.customers.detail(row.original.customer_id)}
        className="text-primary hover:underline"
      >
        {row.original.customer_name}
      </Link>
    ),
  },
  {
    accessorKey: "total_revenue_snapshot",
    header: "Revenue",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCurrency(row.original.total_revenue_snapshot)}</span>
    ),
  },
  {
    accessorKey: "total_profit_snapshot",
    header: "Profit",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCurrency(row.original.total_profit_snapshot)}</span>
    ),
  },
  {
    accessorKey: "delivery_fee_snapshot",
    header: "Delivery fee",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCurrency(row.original.delivery_fee_snapshot)}</span>
    ),
  },
  {
    accessorKey: "payment_method",
    header: "Payment method",
    cell: ({ row }) => (
      <span className="text-text-secondary">{formatEnumLabel(row.original.payment_method)}</span>
    ),
  },
  {
    accessorKey: "payment_status",
    header: "Payment status",
    cell: ({ row }) => (
      <span className="text-text-secondary">{formatEnumLabel(row.original.payment_status)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Order status",
    cell: ({ row }) => (
      <span className="text-text-secondary">{formatEnumLabel(row.original.status)}</span>
    ),
  },
  {
    accessorKey: "delivery_area_name",
    header: "Delivery area",
    cell: ({ row }) => (
      <span className="text-text-secondary">{row.original.delivery_area_name ?? "—"}</span>
    ),
  },
  {
    accessorKey: "scheduled_delivery_date",
    header: "Scheduled delivery",
    cell: ({ row }) => formatDate(row.original.scheduled_delivery_date),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.created_at),
  },
];

export function OrderAnalyticsDashboard() {
  const [preset, setPreset] = useState<AnalyticsDatePreset>("last_30_days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [granularity, setGranularity] = useState<TrendGranularity>("day");

  const chartParams = useMemo((): AnalyticsQueryParams | null => {
    if (preset === "custom" && (!customStart || !customEnd)) {
      return null;
    }
    return buildAnalyticsQueryParams(preset, customStart, customEnd, granularity, CHART_LIMIT);
  }, [preset, customStart, customEnd, granularity]);

  const tableParams = useMemo((): AnalyticsQueryParams | null => {
    if (preset === "custom" && (!customStart || !customEnd)) {
      return null;
    }
    return buildAnalyticsQueryParams(preset, customStart, customEnd, "day", TABLE_LIMIT);
  }, [preset, customStart, customEnd]);

  const enabled = chartParams !== null;

  const queries = useQueries({
    queries: [
      {
        queryKey: analyticsQueryKey("order-kpis", chartParams ?? {}),
        queryFn: () => analyticsApi.getOrderKpis(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("order-insights", chartParams ?? {}),
        queryFn: () => analyticsApi.getOrderInsights(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("order-status-distribution", chartParams ?? {}),
        queryFn: () => analyticsApi.getOrderStatusDistribution(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("order-payment-status-distribution", chartParams ?? {}),
        queryFn: () => analyticsApi.getOrderPaymentStatusDistribution(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("order-payment-method-distribution", chartParams ?? {}),
        queryFn: () => analyticsApi.getOrderPaymentMethodDistribution(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("order-source-distribution", chartParams ?? {}),
        queryFn: () => analyticsApi.getOrderSourceDistribution(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("order-fulfillment-trends", chartParams ?? {}),
        queryFn: () => analyticsApi.getOrderFulfillmentTrends(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("order-delivery-trends", chartParams ?? {}),
        queryFn: () => analyticsApi.getOrderDeliveryTrends(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("order-delivery-area-distribution", chartParams ?? {}),
        queryFn: () => analyticsApi.getOrderDeliveryAreaDistribution(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("order-performance", tableParams ?? {}),
        queryFn: () => analyticsApi.getOrderPerformance(tableParams!),
        enabled: tableParams !== null,
      },
    ],
  });

  const [
    kpisQuery,
    insightsQuery,
    statusQuery,
    paymentStatusQuery,
    paymentMethodQuery,
    sourceQuery,
    fulfillmentQuery,
    deliveryTrendsQuery,
    deliveryAreaQuery,
    performanceQuery,
  ] = queries;

  const kpis = kpisQuery.data;
  const rangeLabel = kpis
    ? formatRangeLabel(kpis.date_range.start_date, kpis.date_range.end_date)
    : undefined;

  const chartGranularity = fulfillmentQuery.data?.granularity ?? granularity;

  const fulfillmentChartData = useMemo(() => {
    const points = toTrendPoints(fulfillmentQuery.data?.points ?? []);
    return toAnalyticsChartData(points, chartGranularity);
  }, [fulfillmentQuery.data, chartGranularity]);

  const deliveryChartData = useMemo(() => {
    const points = toTrendPoints(deliveryTrendsQuery.data?.points ?? []);
    return toAnalyticsChartData(points, chartGranularity);
  }, [deliveryTrendsQuery.data, chartGranularity]);

  const statusDonut = useMemo(
    () => toDonutData(statusQuery.data?.items ?? []),
    [statusQuery.data],
  );
  const paymentStatusDonut = useMemo(
    () => toDonutData(paymentStatusQuery.data?.items ?? []),
    [paymentStatusQuery.data],
  );
  const paymentMethodBar = useMemo(
    () => toBarData(paymentMethodQuery.data?.items ?? []),
    [paymentMethodQuery.data],
  );
  const sourceBar = useMemo(() => toBarData(sourceQuery.data?.items ?? []), [sourceQuery.data]);
  const deliveryAreaBar = useMemo(
    () => toBarData(deliveryAreaQuery.data?.items ?? []),
    [deliveryAreaQuery.data],
  );

  const formatCount = useCallback((value: number) => value.toLocaleString("en-LK"), []);

  const distributionLoading =
    statusQuery.isLoading ||
    paymentStatusQuery.isLoading ||
    paymentMethodQuery.isLoading ||
    sourceQuery.isLoading;

  const hasQueryError = queries.some((query) => query.isError);

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
        resolvedRange={kpis?.date_range}
      />

      {!enabled ? (
        <p className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-sm text-text-secondary">
          Choose a start and end date to load order analytics.
        </p>
      ) : null}

      {hasQueryError ? (
        <div className="rounded-lg border border-danger/40 bg-surface px-4 py-3 text-sm text-danger">
          Unable to load order analytics. Check your connection and try again.
        </div>
      ) : null}

      {enabled ? (
        <>
          {kpisQuery.isLoading && !kpis ? (
            <AnalyticsKpiGridSkeleton layout="order" />
          ) : kpis ? (
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AnalyticsKpiCard
                variant="orders"
                label="Total orders"
                value={Number(kpis.total_orders.value).toLocaleString("en-LK")}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="orders"
                label="Completed orders"
                value={Number(kpis.completed_orders.value).toLocaleString("en-LK")}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="orders"
                label="Average order value"
                value={formatCurrency(kpis.average_order_value.value)}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="orders"
                label="Fulfillment rate"
                value={formatPercent(kpis.fulfillment_rate.value)}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="orders"
                label="Delivery success rate"
                value={formatPercent(kpis.delivery_success_rate.value)}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="orders"
                label="Average delivery fee"
                value={formatCurrency(kpis.average_delivery_fee.value)}
                dateRangeLabel={rangeLabel}
              />
            </dl>
          ) : null}

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-text-primary">
                Operational insights
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Fulfillment, payment, and delivery highlights from order snapshots.
              </p>
            </div>
            {insightsQuery.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-36 animate-pulse rounded-xl bg-surface-hover"
                  />
                ))}
              </div>
            ) : insightsQuery.data?.items.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {insightsQuery.data.items.map((insight) => (
                  <AnalyticsInsightCard
                    key={insight.id}
                    title={insight.title}
                    name={insight.name}
                    metricLabel={insight.metric_label}
                    metricValue={insight.metric_value}
                    entityType="order"
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border bg-background/50 px-4 py-10 text-center text-sm text-text-secondary">
                Insights will appear once orders exist in this period.
              </p>
            )}
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <AnalyticsChartCard
              category="orders"
              title="Order status distribution"
              description="Lifecycle status for non-draft orders placed in the period."
            >
              <AnalyticsDonutChart
                category="orders"
                data={statusDonut}
                formatValue={formatCount}
                isLoading={statusQuery.isLoading}
                isError={statusQuery.isError}
                emptyTitle="No orders found in this period"
                emptyDescription="Order status distribution appears when orders are placed in the range."
              />
            </AnalyticsChartCard>

            <AnalyticsChartCard
              category="orders"
              title="Payment status distribution"
              description="Payment lifecycle states from order snapshots."
            >
              <AnalyticsDonutChart
                category="orders"
                data={paymentStatusDonut}
                formatValue={formatCount}
                isLoading={paymentStatusQuery.isLoading}
                isError={paymentStatusQuery.isError}
                emptyTitle="No orders found in this period"
                emptyDescription="Payment status breakdown requires orders in the selected range."
              />
            </AnalyticsChartCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AnalyticsChartCard
              category="orders"
              title="Payment method distribution"
              description="How customers paid for orders in this period."
            >
              <AnalyticsBarChart
                category="orders"
                data={paymentMethodBar}
                formatValue={formatCount}
                valueLabel="Orders"
                isLoading={distributionLoading}
                isError={paymentMethodQuery.isError}
                emptyTitle="No orders found in this period"
                emptyDescription="Payment method data appears when orders are recorded."
              />
            </AnalyticsChartCard>

            <AnalyticsChartCard
              category="orders"
              title="Order source distribution"
              description="Manual, phone, walk-in, and online channels (grouped)."
            >
              <AnalyticsBarChart
                category="orders"
                data={sourceBar}
                formatValue={formatCount}
                valueLabel="Orders"
                isLoading={distributionLoading}
                isError={sourceQuery.isError}
                emptyTitle="No orders found in this period"
                emptyDescription="Source distribution reflects how orders were captured."
              />
            </AnalyticsChartCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AnalyticsChartCard
              category="orders"
              title="Orders fulfilled over time"
              description="Orders marked delivered, bucketed by delivery timestamp."
            >
              <AnalyticsLineChart
                category="orders"
                data={fulfillmentChartData}
                formatValue={formatCount}
                valueLabel="Orders fulfilled"
                isLoading={fulfillmentQuery.isLoading}
                isError={fulfillmentQuery.isError}
                emptyTitle="No fulfilled orders in this period"
                emptyDescription="Fulfillment trends appear when orders are marked delivered."
              />
            </AnalyticsChartCard>

            <AnalyticsChartCard
              category="orders"
              title="Deliveries over time"
              description="Delivered orders by scheduled delivery date."
            >
              <AnalyticsAreaChart
                category="orders"
                data={deliveryChartData}
                formatValue={formatCount}
                valueLabel="Deliveries"
                isLoading={deliveryTrendsQuery.isLoading}
                isError={deliveryTrendsQuery.isError}
                emptyTitle="No delivery activity in this period"
                emptyDescription="Delivery volume charts completed orders by scheduled date."
              />
            </AnalyticsChartCard>
          </div>

          <AnalyticsChartCard
            category="orders"
            title="Delivery area distribution"
            description="Top delivery areas by order count."
          >
            <AnalyticsBarChart
              category="orders"
              data={deliveryAreaBar}
              layout="horizontal"
              formatValue={formatCount}
              valueLabel="Orders"
              isLoading={deliveryAreaQuery.isLoading}
              isError={deliveryAreaQuery.isError}
              emptyTitle="No delivery activity in this period"
              emptyDescription="Assign delivery areas on orders to see geographic distribution."
            />
          </AnalyticsChartCard>

          <AnalyticsChartCard
            category="orders"
            title="Order performance"
            description="Orders in the selected period. Click column headers to sort."
          >
            <AnalyticsSortableTable
              columns={performanceColumns}
              data={performanceQuery.data?.items ?? []}
              isLoading={performanceQuery.isLoading}
              emptyMessage="No orders found in this period."
            />
          </AnalyticsChartCard>
        </>
      ) : null}
    </div>
  );
}
