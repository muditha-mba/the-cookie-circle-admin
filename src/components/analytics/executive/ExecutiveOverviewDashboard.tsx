"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";

import { AnalyticsDateRangeControls } from "@/components/analytics/AnalyticsDateRangeControls";
import { AnalyticsGranularityToggle } from "@/components/analytics/AnalyticsGranularityToggle";
import { AnalyticsInsightCard } from "@/components/analytics/AnalyticsInsightCard";
import { AnalyticsKpiCard, AnalyticsKpiGridSkeleton } from "@/components/analytics/AnalyticsKpiCard";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { inventoryApi } from "@/lib/api/inventory";
import {
  AnalyticsChartCard,
  AnalyticsDonutChart,
  AnalyticsLineChart,
  toAnalyticsChartData,
  type AnalyticsChartPoint,
  type AnalyticsDonutDatum,
} from "@/components/analytics/charts";
import { routes } from "@/config/routes";
import {
  analyticsApi,
  analyticsQueryKey,
  buildAnalyticsQueryParams,
  type AnalyticsQueryParams,
} from "@/lib/api/analytics";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { useAnalyticsUrlFilters } from "@/components/analytics/useAnalyticsUrlFilters";

function formatRangeLabel(start: string, end: string) {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function ExecutiveOverviewDashboard() {
  const { canManageFinancialRecords } = useAdminPermissions();
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

  const params = useMemo((): AnalyticsQueryParams | null => {
    if (preset === "custom" && (!customStart || !customEnd)) return null;
    return buildAnalyticsQueryParams(preset, customStart, customEnd, granularity, 10);
  }, [preset, customStart, customEnd, granularity]);

  const enabled = params !== null;
  const [kpisQuery, highlightsQuery, revenueContributionQuery, revenueTrendsQuery, orderTrendsQuery, customerGrowthQuery] =
    useQueries({
      queries: [
        {
          queryKey: analyticsQueryKey("executive-kpis", params ?? {}),
          queryFn: () => analyticsApi.getExecutiveKpis(params!),
          enabled,
        },
        {
          queryKey: analyticsQueryKey("executive-highlights", params ?? {}),
          queryFn: () => analyticsApi.getExecutiveHighlights(params!),
          enabled,
        },
        {
          queryKey: analyticsQueryKey("executive-contribution", params ?? {}),
          queryFn: () => analyticsApi.getExecutiveRevenueContribution(params!),
          enabled,
        },
        {
          queryKey: analyticsQueryKey("executive-revenue-trend", params ?? {}),
          queryFn: () => analyticsApi.getRevenueTrends(params!),
          enabled,
        },
        {
          queryKey: analyticsQueryKey("executive-orders-trend", params ?? {}),
          queryFn: () => analyticsApi.getOrderTrends(params!),
          enabled,
        },
        {
          queryKey: analyticsQueryKey("executive-customer-growth", params ?? {}),
          queryFn: () => analyticsApi.getCustomerGrowth(params!),
          enabled,
        },
      ],
    });

  const operationsSnapshotQuery = useQuery({
    queryKey: ["analytics", "executive-operations-snapshot"],
    queryFn: () => analyticsApi.getExecutiveOperationsSnapshot(),
  });

  const purchasesQuery = useQuery({
    queryKey: [
      "inventory-expense-summary",
      kpisQuery.data?.date_range.start_date,
      kpisQuery.data?.date_range.end_date,
    ],
    queryFn: () =>
      inventoryApi.getExpenseSummary(
        kpisQuery.data!.date_range.start_date,
        kpisQuery.data!.date_range.end_date,
      ),
    enabled:
      canManageFinancialRecords &&
      Boolean(kpisQuery.data?.date_range.start_date && kpisQuery.data?.date_range.end_date),
  });

  const kpis = kpisQuery.data;
  const rangeLabel = kpis ? formatRangeLabel(kpis.date_range.start_date, kpis.date_range.end_date) : undefined;

  const revenueTrendData = useMemo(
    () =>
      toAnalyticsChartData(
        (revenueTrendsQuery.data?.points ?? []).map(
          (p): AnalyticsChartPoint => ({ periodStart: p.period_start, value: Number(p.revenue) || 0 }),
        ),
        granularity,
      ),
    [revenueTrendsQuery.data, granularity],
  );
  const ordersTrendData = useMemo(
    () =>
      toAnalyticsChartData(
        (orderTrendsQuery.data?.points ?? []).map(
          (p): AnalyticsChartPoint => ({ periodStart: p.period_start, value: p.order_count }),
        ),
        granularity,
      ),
    [orderTrendsQuery.data, granularity],
  );
  const customerGrowthData = useMemo(
    () =>
      toAnalyticsChartData(
        (customerGrowthQuery.data?.points ?? []).map(
          (p): AnalyticsChartPoint => ({ periodStart: p.period_start, value: p.new_customers }),
        ),
        granularity,
      ),
    [customerGrowthQuery.data, granularity],
  );
  const contributionData = useMemo(
    (): AnalyticsDonutDatum[] =>
      (revenueContributionQuery.data?.items ?? []).map((item) => ({
        name: item.name,
        value: Number(item.value) || 0,
      })),
    [revenueContributionQuery.data],
  );

  const highlights = highlightsQuery.data;
  const insightCards = [
    { id: "top_product", title: "Top Product", name: highlights?.top_product, metric: "Ranked by sold units" },
    { id: "top_collection", title: "Top Collection", name: highlights?.top_collection, metric: "Ranked by sold units" },
    { id: "top_package", title: "Top Package", name: highlights?.top_package, metric: "Ranked by sold units" },
    { id: "top_customer", title: "Top Customer", name: highlights?.top_customer, metric: "Highest lifetime spend" },
    {
      id: "top_delivery_area",
      title: "Highest Revenue Delivery Area",
      name: highlights?.highest_revenue_delivery_area,
      metric: "Revenue contribution",
    },
    {
      id: "top_payment_method",
      title: "Most Used Payment Method",
      name: highlights?.most_used_payment_method,
      metric: "Orders count",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-text-primary">Executive Overview</h2>
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

      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Dashboard Drilldowns
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={routes.analytics.revenue} className="rounded-md border border-border px-3 py-1.5 text-sm text-primary hover:bg-surface-hover">Revenue</Link>
          <Link href={routes.analytics.products} className="rounded-md border border-border px-3 py-1.5 text-sm text-primary hover:bg-surface-hover">Products</Link>
          <Link href={routes.analytics.collections} className="rounded-md border border-border px-3 py-1.5 text-sm text-primary hover:bg-surface-hover">Collections</Link>
          <Link href={routes.analytics.customers} className="rounded-md border border-border px-3 py-1.5 text-sm text-primary hover:bg-surface-hover">Customers</Link>
          <Link href={routes.analytics.orders} className="rounded-md border border-border px-3 py-1.5 text-sm text-primary hover:bg-surface-hover">Orders</Link>
          <Link href={routes.analytics.production} className="rounded-md border border-border px-3 py-1.5 text-sm text-primary hover:bg-surface-hover">Production</Link>
          <Link href={routes.analytics.operations} className="rounded-md border border-border px-3 py-1.5 text-sm text-primary hover:bg-surface-hover">Operations</Link>
          <Link href={routes.analytics.overhead} className="rounded-md border border-border px-3 py-1.5 text-sm text-primary hover:bg-surface-hover">Overhead</Link>
          <Link href={routes.analytics.discounts} className="rounded-md border border-border px-3 py-1.5 text-sm text-primary hover:bg-surface-hover">Discounts</Link>
        </div>
      </div>

      {enabled && !kpis ? (
        <AnalyticsKpiGridSkeleton />
      ) : kpis ? (
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnalyticsKpiCard variant="revenue" label="Total Revenue" value={formatCurrency(kpis.total_revenue.value)} dateRangeLabel={rangeLabel} trendPercentage={kpis.total_revenue.trend_percentage} trendDirection={kpis.total_revenue.trend_direction} />
          <AnalyticsKpiCard variant="profit" label="Total Profit" value={formatCurrency(kpis.total_profit.value)} dateRangeLabel={rangeLabel} trendPercentage={kpis.total_profit.trend_percentage} trendDirection={kpis.total_profit.trend_direction} />
          <AnalyticsKpiCard variant="orders" label="Total Orders" value={Number(kpis.total_orders.value).toLocaleString("en-LK")} dateRangeLabel={rangeLabel} trendPercentage={kpis.total_orders.trend_percentage} trendDirection={kpis.total_orders.trend_direction} />
          <AnalyticsKpiCard variant="customers" label="Total Customers" value={Number(kpis.total_customers.value).toLocaleString("en-LK")} dateRangeLabel={rangeLabel} trendPercentage={kpis.total_customers.trend_percentage} trendDirection={kpis.total_customers.trend_direction} />
          <AnalyticsKpiCard variant="average_order_value" label="Average Order Value" value={formatCurrency(kpis.average_order_value.value)} dateRangeLabel={rangeLabel} trendPercentage={kpis.average_order_value.trend_percentage} trendDirection={kpis.average_order_value.trend_direction} />
          <AnalyticsKpiCard variant="margin" label="Average Margin %" value={formatPercent(kpis.average_margin_percentage.value)} dateRangeLabel={rangeLabel} trendPercentage={kpis.average_margin_percentage.trend_percentage} trendDirection={kpis.average_margin_percentage.trend_direction} />
        </dl>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {insightCards.map((item) => (
          <AnalyticsInsightCard
            key={item.id}
            title={item.title}
            name={item.name ?? "—"}
            metricLabel="Source"
            metricValue={item.metric}
            entityType="operations"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsChartCard category="revenue" title="Revenue Trend">
          <AnalyticsLineChart category="revenue" data={revenueTrendData} formatValue={(v) => formatCurrency(v)} valueLabel="Revenue" />
        </AnalyticsChartCard>
        <AnalyticsChartCard category="orders" title="Orders Trend">
          <AnalyticsLineChart category="orders" data={ordersTrendData} formatValue={(v) => v.toLocaleString("en-LK")} valueLabel="Orders" />
        </AnalyticsChartCard>
        <AnalyticsChartCard category="customers" title="Customer Growth">
          <AnalyticsLineChart category="customers" data={customerGrowthData} formatValue={(v) => v.toLocaleString("en-LK")} valueLabel="Customers" />
        </AnalyticsChartCard>
        <AnalyticsChartCard category="revenue" title="Revenue Contribution">
          <AnalyticsDonutChart category="revenue" data={contributionData} formatValue={(v) => formatCurrency(v)} />
        </AnalyticsChartCard>
      </div>

      <AnalyticsChartCard category="operations" title="Operations Snapshot">
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AnalyticsKpiCard variant="production" label="Upcoming Production Batch" value={operationsSnapshotQuery.data?.upcoming_production_batch ? formatDate(operationsSnapshotQuery.data.upcoming_production_batch) : "—"} />
          <AnalyticsKpiCard variant="orders" label="Upcoming Orders" value={(operationsSnapshotQuery.data?.upcoming_orders ?? 0).toLocaleString("en-LK")} />
          <AnalyticsKpiCard variant="orders" label="Orders Awaiting Preparation" value={(operationsSnapshotQuery.data?.orders_awaiting_preparation ?? 0).toLocaleString("en-LK")} />
          <AnalyticsKpiCard variant="orders" label="Orders Awaiting Delivery" value={(operationsSnapshotQuery.data?.orders_awaiting_delivery ?? 0).toLocaleString("en-LK")} />
        </dl>
      </AnalyticsChartCard>

      {canManageFinancialRecords ? (
        <AnalyticsChartCard category="revenue" title="Purchase Spend">
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnalyticsKpiCard
              variant="revenue"
              label="Confirmed receipt spend"
              value={
                purchasesQuery.isLoading
                  ? "—"
                  : formatCurrency(purchasesQuery.data?.total_amount ?? "0")
              }
              dateRangeLabel={rangeLabel}
            />
            <AnalyticsKpiCard
              variant="orders"
              label="Confirmed receipts"
              value={
                purchasesQuery.isLoading
                  ? "—"
                  : (purchasesQuery.data?.receipt_count ?? 0).toLocaleString("en-LK")
              }
              dateRangeLabel={rangeLabel}
            />
            <AnalyticsKpiCard
              variant="profit"
              label="Top supplier spend"
              value={
                purchasesQuery.isLoading
                  ? "—"
                  : purchasesQuery.data?.by_supplier[0]
                    ? formatCurrency(purchasesQuery.data.by_supplier[0].total_amount)
                    : "—"
              }
              dateRangeLabel={
                purchasesQuery.data?.by_supplier[0]?.supplier_name ?? rangeLabel
              }
            />
          </dl>
          {purchasesQuery.data && purchasesQuery.data.by_item_type.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-secondary">
                    <th className="py-2 pr-4 font-medium">Item type</th>
                    <th className="py-2 font-medium">Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {purchasesQuery.data.by_item_type.map((row) => (
                    <tr key={row.item_type_id}>
                      <td className="py-2 pr-4 text-text-primary">{row.item_type_name}</td>
                      <td className="py-2 tabular-nums text-text-secondary">
                        {formatCurrency(row.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </AnalyticsChartCard>
      ) : null}

    </div>
  );
}
