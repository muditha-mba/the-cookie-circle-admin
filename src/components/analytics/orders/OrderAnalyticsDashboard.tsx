"use client";

import { useQueries } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useCallback, useMemo } from "react";
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
  analyticsExportUrl,
  analyticsQueryKey,
  buildAnalyticsQueryParams,
  type AnalyticsQueryParams,
  type OrderDeliveryAreaPerformanceRow,
  type OrderPaymentMethodPerformanceRow,
  type OrderAnalyticsPerformanceRow,
  type OrderDistributionItem,
} from "@/lib/api/analytics";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { useAnalyticsUrlFilters } from "@/components/analytics/useAnalyticsUrlFilters";

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

function toDeliveryAreaRevenueBar(items: OrderDeliveryAreaPerformanceRow[]): AnalyticsChartDatum[] {
  return items.map((item) => ({
    label: truncateLabel(item.area_name),
    value: Number(item.revenue_snapshot) || 0,
  }));
}

function toDeliveryAreaOrdersBar(items: OrderDeliveryAreaPerformanceRow[]): AnalyticsChartDatum[] {
  return items.map((item) => ({
    label: truncateLabel(item.area_name),
    value: item.order_count,
  }));
}

function toPaymentMethodRevenueBar(items: OrderPaymentMethodPerformanceRow[]): AnalyticsChartDatum[] {
  return items.map((item) => ({
    label: truncateLabel(formatEnumLabel(item.payment_method)),
    value: Number(item.revenue_snapshot) || 0,
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
    accessorKey: "package_type",
    header: "Package type",
    cell: ({ row }) => <span className="text-text-secondary">{row.original.package_type}</span>,
  },
  {
    accessorKey: "collections_value_snapshot",
    header: "Collections value",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatCurrency(row.original.collections_value_snapshot)}
      </span>
    ),
  },
  {
    accessorKey: "products_value_snapshot",
    header: "Products value",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCurrency(row.original.products_value_snapshot)}</span>
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
    accessorKey: "total_cost_snapshot",
    header: "Cost",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCurrency(row.original.total_cost_snapshot)}</span>
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
    accessorKey: "margin_percentage_snapshot",
    header: "Margin %",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatPercent(row.original.margin_percentage_snapshot)}</span>
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
  const {
    preset,
    customStart,
    customEnd,
    granularity,
    setPreset,
    setCustomStart,
    setCustomEnd,
    setGranularity,
  } = useAnalyticsUrlFilters();

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
        queryKey: analyticsQueryKey("order-type-distribution", chartParams ?? {}),
        queryFn: () => analyticsApi.getOrderTypeDistribution(chartParams!),
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
        queryKey: analyticsQueryKey("order-lifecycle-trends", chartParams ?? {}),
        queryFn: () => analyticsApi.getOrderLifecycleTrends(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("order-delivery-area-performance", chartParams ?? {}),
        queryFn: () => analyticsApi.getOrderDeliveryAreaPerformance(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("order-payment-method-performance", chartParams ?? {}),
        queryFn: () => analyticsApi.getOrderPaymentMethodPerformance(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("order-customer-behaviour", chartParams ?? {}),
        queryFn: () => analyticsApi.getOrderCustomerBehaviour(chartParams!),
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
    orderTypeQuery,
    fulfillmentQuery,
    deliveryTrendsQuery,
    lifecycleTrendsQuery,
    deliveryAreaPerformanceQuery,
    paymentMethodPerformanceQuery,
    customerBehaviourQuery,
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
  const orderTypeDonut = useMemo(
    () => toDonutData(orderTypeQuery.data?.items ?? []),
    [orderTypeQuery.data],
  );
  const lifecycleDeliveredData = useMemo(() => {
    const points =
      lifecycleTrendsQuery.data?.points.map((point) => ({
        periodStart: point.period_start,
        value: point.delivered,
      })) ?? [];
    return toAnalyticsChartData(points, chartGranularity);
  }, [lifecycleTrendsQuery.data, chartGranularity]);
  const deliveryAreaRevenueBar = useMemo(
    () => toDeliveryAreaRevenueBar(deliveryAreaPerformanceQuery.data?.items ?? []),
    [deliveryAreaPerformanceQuery.data],
  );
  const deliveryAreaOrdersBar = useMemo(
    () => toDeliveryAreaOrdersBar(deliveryAreaPerformanceQuery.data?.items ?? []),
    [deliveryAreaPerformanceQuery.data],
  );
  const paymentMethodRevenueBar = useMemo(
    () => toPaymentMethodRevenueBar(paymentMethodPerformanceQuery.data?.items ?? []),
    [paymentMethodPerformanceQuery.data],
  );

  const formatCount = useCallback((value: number) => value.toLocaleString("en-LK"), []);

  const distributionLoading =
    statusQuery.isLoading ||
    paymentStatusQuery.isLoading ||
    paymentMethodQuery.isLoading ||
    sourceQuery.isLoading ||
    orderTypeQuery.isLoading;

  const hasQueryError = queries.some((query) => query.isError);
  const exportUrl = tableParams ? analyticsExportUrl("orders", tableParams) : null;

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

      {exportUrl ? (
        <div className="flex justify-end">
          <a
            href={exportUrl}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-hover"
          >
            Export CSV
          </a>
        </div>
      ) : null}

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
                trendPercentage={kpis.total_orders.trend_percentage}
                trendDirection={kpis.total_orders.trend_direction}
              />
              <AnalyticsKpiCard
                variant="orders"
                label="Completed orders"
                value={Number(kpis.completed_orders.value).toLocaleString("en-LK")}
                dateRangeLabel={rangeLabel}
                trendPercentage={kpis.completed_orders.trend_percentage}
                trendDirection={kpis.completed_orders.trend_direction}
              />
              <AnalyticsKpiCard
                variant="orders"
                label="Cancelled orders"
                value={Number(kpis.cancelled_orders.value).toLocaleString("en-LK")}
                dateRangeLabel={rangeLabel}
                trendPercentage={kpis.cancelled_orders.trend_percentage}
                trendDirection={kpis.cancelled_orders.trend_direction}
              />
              <AnalyticsKpiCard
                variant="orders"
                label="Completion rate"
                value={formatPercent(kpis.completion_rate.value)}
                dateRangeLabel={rangeLabel}
                trendPercentage={kpis.completion_rate.trend_percentage}
                trendDirection={kpis.completion_rate.trend_direction}
              />
              <AnalyticsKpiCard
                variant="orders"
                label="Average order value"
                value={formatCurrency(kpis.average_order_value.value)}
                dateRangeLabel={rangeLabel}
                trendPercentage={kpis.average_order_value.trend_percentage}
                trendDirection={kpis.average_order_value.trend_direction}
              />
              <AnalyticsKpiCard
                variant="orders"
                label="Revenue from orders"
                value={formatCurrency(kpis.revenue_from_orders.value)}
                dateRangeLabel={rangeLabel}
                trendPercentage={kpis.revenue_from_orders.trend_percentage}
                trendDirection={kpis.revenue_from_orders.trend_direction}
              />
              <AnalyticsKpiCard
                variant="orders"
                label="Average profit per order"
                value={formatCurrency(kpis.average_profit_per_order.value)}
                dateRangeLabel={rangeLabel}
                trendPercentage={kpis.average_profit_per_order.trend_percentage}
                trendDirection={kpis.average_profit_per_order.trend_direction}
              />
              <AnalyticsKpiCard
                variant="orders"
                label="Average margin"
                value={formatPercent(kpis.average_margin_percentage.value)}
                dateRangeLabel={rangeLabel}
                trendPercentage={kpis.average_margin_percentage.trend_percentage}
                trendDirection={kpis.average_margin_percentage.trend_direction}
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
              title="Revenue by payment method"
              description="Snapshot revenue grouped by payment method."
            >
              <AnalyticsBarChart
                category="orders"
                data={paymentMethodRevenueBar}
                formatValue={(value) => formatCurrency(value)}
                valueLabel="Revenue"
                isLoading={paymentMethodPerformanceQuery.isLoading}
                isError={paymentMethodPerformanceQuery.isError}
                emptyTitle="No payment revenue in this period"
                emptyDescription="Revenue reflects immutable order snapshot totals."
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

            <AnalyticsChartCard
              category="orders"
              title="Order type distribution"
              description="Weekly delivery collections versus catering cookie orders."
            >
              <AnalyticsDonutChart
                category="orders"
                data={orderTypeDonut}
                formatValue={formatCount}
                isLoading={orderTypeQuery.isLoading}
                isError={orderTypeQuery.isError}
                emptyTitle="No orders found in this period"
                emptyDescription="Order type breakdown appears when orders are recorded."
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
              title="Delivery completion trend"
              description="Delivered status counts over time."
            >
              <AnalyticsLineChart
                category="orders"
                data={lifecycleDeliveredData}
                formatValue={formatCount}
                valueLabel="Delivered"
                isLoading={lifecycleTrendsQuery.isLoading}
                isError={lifecycleTrendsQuery.isError}
                emptyTitle="No lifecycle data in this period"
                emptyDescription="Completion trend appears when orders move through lifecycle statuses."
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
            title="Delivery area revenue"
            description="Revenue by delivery area from order snapshots."
          >
            <AnalyticsBarChart
              category="orders"
              data={deliveryAreaRevenueBar}
              layout="horizontal"
              formatValue={(value) => formatCurrency(value)}
              valueLabel="Revenue"
              isLoading={deliveryAreaPerformanceQuery.isLoading}
              isError={deliveryAreaPerformanceQuery.isError}
              emptyTitle="No delivery activity in this period"
              emptyDescription="Assign delivery areas on orders to see geographic distribution."
            />
          </AnalyticsChartCard>

          <AnalyticsChartCard
            category="orders"
            title="Delivery area order volume"
            description="Order count by delivery area."
          >
            <AnalyticsBarChart
              category="orders"
              data={deliveryAreaOrdersBar}
              layout="horizontal"
              formatValue={formatCount}
              valueLabel="Orders"
              isLoading={deliveryAreaPerformanceQuery.isLoading}
              isError={deliveryAreaPerformanceQuery.isError}
              emptyTitle="No delivery activity in this period"
              emptyDescription="Delivery area volumes appear when orders include delivery areas."
            />
          </AnalyticsChartCard>

          <AnalyticsChartCard
            category="orders"
            title="Customer order behaviour"
            description="First-time vs returning behaviour from order history."
          >
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface p-3">
                <dt className="text-xs text-text-secondary">First-time customers</dt>
                <dd className="mt-1 text-base font-semibold tabular-nums text-text-primary">
                  {(customerBehaviourQuery.data?.first_time_customers ?? 0).toLocaleString("en-LK")}
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3">
                <dt className="text-xs text-text-secondary">Returning customers</dt>
                <dd className="mt-1 text-base font-semibold tabular-nums text-text-primary">
                  {(customerBehaviourQuery.data?.returning_customers ?? 0).toLocaleString("en-LK")}
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3">
                <dt className="text-xs text-text-secondary">Repeat purchase rate</dt>
                <dd className="mt-1 text-base font-semibold tabular-nums text-text-primary">
                  {formatPercent(customerBehaviourQuery.data?.repeat_purchase_rate ?? 0)}
                </dd>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3">
                <dt className="text-xs text-text-secondary">Average orders per customer</dt>
                <dd className="mt-1 text-base font-semibold tabular-nums text-text-primary">
                  {Number(customerBehaviourQuery.data?.average_orders_per_customer ?? 0).toFixed(2)}
                </dd>
              </div>
            </dl>
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
