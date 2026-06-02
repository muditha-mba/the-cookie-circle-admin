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
  AnalyticsBarChart,
  AnalyticsChartCard,
  AnalyticsDonutChart,
  AnalyticsLineChart,
  formatPeriodLabel,
  type AnalyticsChartDatum,
  type AnalyticsDonutDatum,
} from "@/components/analytics/charts";
import { CustomerSegmentBadge } from "@/components/customers/CustomerSegmentBadge";
import { routes } from "@/config/routes";
import {
  analyticsApi,
  analyticsQueryKey,
  buildAnalyticsQueryParams,
  type AnalyticsDatePreset,
  type AnalyticsQueryParams,
  type CustomerAnalyticsRow,
  type CustomerSegment,
  type TrendGranularity,
} from "@/lib/api/analytics";
import type { CustomerSegment as CrmCustomerSegment } from "@/lib/api/customers";
import { CUSTOMER_SEGMENT_BADGES } from "@/config/status-badges";
import { formatCurrency, formatDate } from "@/lib/format";

const TABLE_LIMIT = 100;

const SEGMENT_CHART_LABELS: Record<CustomerSegment, string> = {
  new: CUSTOMER_SEGMENT_BADGES.new.label,
  returning: CUSTOMER_SEGMENT_BADGES.returning.label,
  vip: CUSTOMER_SEGMENT_BADGES.vip.label,
  inactive: CUSTOMER_SEGMENT_BADGES.inactive.label,
};

function formatRangeLabel(start: string, end: string) {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function truncateLabel(label: string, maxLength = 16): string {
  if (label.length <= maxLength) {
    return label;
  }
  return `${label.slice(0, maxLength - 1)}…`;
}

const topCustomerColumns: ColumnDef<CustomerAnalyticsRow>[] = [
  {
    accessorKey: "customer_name",
    header: "Customer",
    cell: ({ row }) => (
      <Link
        href={routes.customers.detail(row.original.customer_id)}
        className="font-medium text-primary hover:underline"
      >
        {row.original.customer_name}
      </Link>
    ),
  },
  {
    accessorKey: "total_orders",
    header: "Orders",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.total_orders}</span>
    ),
  },
  {
    accessorKey: "lifetime_spend",
    header: "Lifetime spend",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCurrency(row.original.lifetime_spend)}</span>
    ),
  },
  {
    accessorKey: "average_order_value",
    header: "Avg order value",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatCurrency(row.original.average_order_value)}
      </span>
    ),
  },
  {
    accessorKey: "last_order_date",
    header: "Last order",
    cell: ({ row }) =>
      row.original.last_order_date ? formatDate(row.original.last_order_date) : "—",
  },
  {
    accessorKey: "segment",
    header: "Segment",
    cell: ({ row }) => (
      <CustomerSegmentBadge segment={row.original.segment as CrmCustomerSegment | null} />
    ),
  },
];

const segmentTableColumns: ColumnDef<CustomerAnalyticsRow>[] = [
  {
    accessorKey: "customer_name",
    header: "Customer",
    cell: ({ row }) => (
      <Link
        href={routes.customers.detail(row.original.customer_id)}
        className="font-medium text-primary hover:underline"
      >
        {row.original.customer_name}
      </Link>
    ),
  },
  {
    accessorKey: "segment",
    header: "Segment",
    cell: ({ row }) => (
      <CustomerSegmentBadge segment={row.original.segment as CrmCustomerSegment | null} />
    ),
  },
  {
    accessorKey: "lifetime_spend",
    header: "Lifetime spend",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCurrency(row.original.lifetime_spend)}</span>
    ),
  },
  {
    accessorKey: "total_orders",
    header: "Order count",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.total_orders}</span>
    ),
  },
  {
    accessorKey: "last_order_date",
    header: "Last order",
    cell: ({ row }) =>
      row.original.last_order_date ? formatDate(row.original.last_order_date) : "—",
  },
  {
    accessorKey: "marketing_source",
    header: "Marketing source",
    cell: ({ row }) => (
      <span className="text-text-secondary">
        {row.original.marketing_source
          ? row.original.marketing_source.replace(/_/g, " ").replace(/\b\w/g, (c) =>
              c.toUpperCase(),
            )
          : "—"}
      </span>
    ),
  },
];

export function CustomerAnalyticsDashboard() {
  const [preset, setPreset] = useState<AnalyticsDatePreset>("last_30_days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [granularity, setGranularity] = useState<TrendGranularity>("day");

  const chartParams = useMemo((): AnalyticsQueryParams | null => {
    if (preset === "custom" && (!customStart || !customEnd)) {
      return null;
    }
    return buildAnalyticsQueryParams(preset, customStart, customEnd, granularity, TABLE_LIMIT);
  }, [preset, customStart, customEnd, granularity]);

  const enabled = chartParams !== null;

  const queries = useQueries({
    queries: [
      {
        queryKey: analyticsQueryKey("customer-kpis", chartParams ?? {}),
        queryFn: () => analyticsApi.getCustomerKpis(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("customer-insights", chartParams ?? {}),
        queryFn: () => analyticsApi.getCustomerInsights(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("customer-growth", chartParams ?? {}),
        queryFn: () => analyticsApi.getCustomerGrowth(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("customer-segments", chartParams ?? {}),
        queryFn: () => analyticsApi.getCustomerSegments(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("customer-marketing", chartParams ?? {}),
        queryFn: () => analyticsApi.getMarketingSourcePerformance(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("customer-performance", chartParams ?? {}),
        queryFn: () => analyticsApi.getCustomerPerformance(chartParams!),
        enabled,
      },
    ],
  });

  const [kpisQuery, insightsQuery, growthQuery, segmentsQuery, marketingQuery, performanceQuery] =
    queries;

  const kpis = kpisQuery.data;
  const rangeLabel = kpis
    ? formatRangeLabel(kpis.date_range.start_date, kpis.date_range.end_date)
    : undefined;

  const chartGranularity = growthQuery.data?.granularity ?? granularity;

  const growthChartData = useMemo((): AnalyticsChartDatum[] => {
    const points = growthQuery.data?.points ?? [];
    return points.map((point) => ({
      label: formatPeriodLabel(point.period_start, chartGranularity),
      value: point.new_customers,
    }));
  }, [growthQuery.data, chartGranularity]);

  const segmentDonutData = useMemo((): AnalyticsDonutDatum[] => {
    return (segmentsQuery.data?.segments ?? []).map((item) => ({
      name: SEGMENT_CHART_LABELS[item.segment],
      value: item.count,
    }));
  }, [segmentsQuery.data]);

  const marketingBarData = useMemo((): AnalyticsChartDatum[] => {
    return (marketingQuery.data?.items ?? []).map((item) => ({
      label: truncateLabel(item.label),
      value: Number(item.revenue_snapshot) || 0,
    }));
  }, [marketingQuery.data]);

  const formatNewCustomers = useCallback(
    (value: number) => value.toLocaleString("en-LK"),
    [],
  );
  const formatRevenue = useCallback((value: number) => formatCurrency(value), []);
  const formatCount = useCallback((value: number) => value.toLocaleString("en-LK"), []);

  const hasQueryError = queries.some((query) => query.isError);
  const chartsLoading =
    growthQuery.isLoading || segmentsQuery.isLoading || marketingQuery.isLoading;

  const performanceRows = performanceQuery.data?.items ?? [];

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
          Choose a start and end date to load customer analytics.
        </p>
      ) : null}

      {hasQueryError ? (
        <div className="rounded-lg border border-danger/40 bg-surface px-4 py-3 text-sm text-danger">
          Unable to load customer analytics. Check your connection and try again.
        </div>
      ) : null}

      {enabled ? (
        <>
          {kpisQuery.isLoading && !kpis ? (
            <AnalyticsKpiGridSkeleton layout="customer" />
          ) : kpis ? (
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AnalyticsKpiCard
                variant="customers"
                label="Total customers"
                value={kpis.total_customers.toLocaleString("en-LK")}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="customers"
                label="New customers"
                value={kpis.new_customers.toLocaleString("en-LK")}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="customers"
                label="Returning customers"
                value={kpis.returning_customers.toLocaleString("en-LK")}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="customers"
                label="VIP customers"
                value={kpis.vip_customers.toLocaleString("en-LK")}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="customers"
                label="Inactive customers"
                value={kpis.inactive_customers.toLocaleString("en-LK")}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="customers"
                label="Avg customer lifetime value"
                value={formatCurrency(kpis.average_customer_lifetime_value)}
                dateRangeLabel={rangeLabel}
              />
            </dl>
          ) : null}

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-text-primary">
                Retention insights
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Acquisition, value, and segment highlights from CRM and order snapshots.
              </p>
            </div>
            {insightsQuery.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 5 }).map((_, index) => (
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
                    entityType="customer"
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border bg-background/50 px-4 py-10 text-center text-sm text-text-secondary">
                Insights will appear once you have customer and order activity in this period.
              </p>
            )}
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <AnalyticsChartCard
              category="customers"
              title="Customer growth over time"
              description="New customers acquired in each period."
            >
              <AnalyticsLineChart
                category="customers"
                data={growthChartData}
                formatValue={formatNewCustomers}
                valueLabel="New customers"
                isLoading={growthQuery.isLoading}
                isError={growthQuery.isError}
                emptyTitle="No new customers in this period"
                emptyDescription="Customer sign-ups will chart here when new customers are added."
              />
            </AnalyticsChartCard>

            <AnalyticsChartCard
              category="customers"
              title="Customer segments"
              description="Active customers in period by calculated segment."
            >
              <AnalyticsDonutChart
                category="customers"
                data={segmentDonutData}
                formatValue={formatCount}
                isLoading={segmentsQuery.isLoading}
                isError={segmentsQuery.isError}
                emptyTitle="No active customers in this period"
                emptyDescription="Segment distribution appears when customers place orders in the range."
              />
            </AnalyticsChartCard>
          </div>

          <AnalyticsChartCard
            category="customers"
            title="Marketing sources"
            description="Revenue from order snapshots attributed to customer marketing source."
          >
            <AnalyticsBarChart
              category="customers"
              data={marketingBarData}
              formatValue={formatRevenue}
              valueLabel="Revenue"
              isLoading={marketingQuery.isLoading}
              isError={marketingQuery.isError}
              emptyTitle="No marketing source data"
              emptyDescription="Set marketing sources on customers and place orders to see channel performance."
            />
          </AnalyticsChartCard>

          <AnalyticsChartCard
            category="customers"
            title="Top customers"
            description="Customers with orders in this period, ranked by lifetime spend (snapshots)."
          >
            <AnalyticsSortableTable
              columns={topCustomerColumns}
              data={performanceRows}
              isLoading={performanceQuery.isLoading}
              emptyMessage="No customers with orders in this period."
            />
          </AnalyticsChartCard>

          <AnalyticsChartCard
            category="customers"
            title="Customer segments"
            description="Segment, spend, and acquisition source for active customers."
          >
            <AnalyticsSortableTable
              columns={segmentTableColumns}
              data={performanceRows}
              isLoading={performanceQuery.isLoading}
              emptyMessage="No customers to display for this period."
            />
          </AnalyticsChartCard>
        </>
      ) : null}
    </div>
  );
}
