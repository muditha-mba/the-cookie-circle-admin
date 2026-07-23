"use client";

import { useQueries } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  type CollectionPackageAnalyticsRow,
  type AnalyticsQueryParams,
  type CollectionAnalyticsRow,
} from "@/lib/api/analytics";
import { formatCurrency, formatDate, formatPercent, formatQuantity } from "@/lib/format";
import { useAnalyticsUrlFilters } from "@/components/analytics/useAnalyticsUrlFilters";

const CHART_LIMIT = 10;
const TABLE_LIMIT = 100;

function formatRangeLabel(start: string, end: string) {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function truncateLabel(name: string, maxLength = 20): string {
  if (name.length <= maxLength) {
    return name;
  }
  return `${name.slice(0, maxLength - 1)}…`;
}

function toCollectionBarData(
  items: CollectionAnalyticsRow[],
  field: "revenue" | "profit" | "units" | "margin",
): AnalyticsChartDatum[] {
  return items.map((item) => ({
    label: truncateLabel(item.name),
    value:
      field === "units"
        ? Number(item.units_sold) || 0
        : field === "profit"
          ? Number(item.profit_snapshot) || 0
          : field === "margin"
            ? Number(item.average_margin_percentage) || 0
            : Number(item.revenue_snapshot) || 0,
  }));
}

function toPackageBarData(
  items: CollectionPackageAnalyticsRow[],
  field: "revenue" | "profit" | "orders" | "margin",
): AnalyticsChartDatum[] {
  return items.map((item) => ({
    label: item.package_name,
    value:
      field === "orders"
        ? item.order_count
        : field === "profit"
          ? Number(item.profit_snapshot) || 0
          : field === "margin"
            ? Number(item.average_margin_percentage) || 0
            : Number(item.revenue_snapshot) || 0,
  }));
}

function toPackageRevenueShareData(items: CollectionPackageAnalyticsRow[]): AnalyticsDonutDatum[] {
  return items.map((item) => ({
    name: item.package_name,
    value: Number(item.revenue_share_percentage) || 0,
  }));
}

function toTrendPoints(
  points: {
    period_start: string;
    revenue: string;
    profit: string;
    units_sold: string;
    order_count: number;
  }[],
  field: "revenue" | "profit" | "order_count",
): AnalyticsChartPoint[] {
  return points.map((point) => ({
    periodStart: point.period_start,
    value:
      field === "order_count"
        ? point.order_count
        : Number(field === "revenue" ? point.revenue : point.profit) || 0,
  }));
}

const collectionColumns: ColumnDef<CollectionAnalyticsRow>[] = [
  {
    accessorKey: "name",
    header: "Collection",
    cell: ({ row }) => (
      <Link
        href={routes.collections.detail(row.original.collection_id)}
        className="font-medium text-primary hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "package_name",
    header: "Package type",
    cell: ({ row }) => <span className="text-text-secondary">{row.original.package_name ?? "—"}</span>,
  },
  {
    accessorKey: "units_sold",
    header: "Units sold",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatQuantity(row.original.units_sold, "units")}
      </span>
    ),
  },
  {
    accessorKey: "revenue_snapshot",
    header: "Revenue",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCurrency(row.original.revenue_snapshot)}</span>
    ),
  },
  {
    accessorKey: "profit_snapshot",
    header: "Profit",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCurrency(row.original.profit_snapshot)}</span>
    ),
  },
  {
    accessorKey: "average_margin_percentage",
    header: "Avg margin",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatPercent(row.original.average_margin_percentage)}
      </span>
    ),
  },
  {
    accessorKey: "average_selling_price",
    header: "Avg selling price",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatCurrency(row.original.average_selling_price)}
      </span>
    ),
  },
  {
    accessorKey: "last_sold_date",
    header: "Last sold",
    cell: ({ row }) =>
      row.original.last_sold_date ? formatDate(row.original.last_sold_date) : "—",
  },
];

const packageColumns: ColumnDef<CollectionPackageAnalyticsRow>[] = [
  {
    accessorKey: "package_name",
    header: "Package type",
    cell: ({ row }) => (
      <Link
        href={`${routes.analytics.collections}?package=${encodeURIComponent(row.original.package_name)}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.package_name}
      </Link>
    ),
  },
  {
    accessorKey: "revenue_snapshot",
    header: "Revenue",
    cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.revenue_snapshot)}</span>,
  },
  {
    accessorKey: "profit_snapshot",
    header: "Profit",
    cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.profit_snapshot)}</span>,
  },
  {
    accessorKey: "average_margin_percentage",
    header: "Margin %",
    cell: ({ row }) => <span className="tabular-nums">{formatPercent(row.original.average_margin_percentage)}</span>,
  },
  {
    accessorKey: "order_count",
    header: "Orders",
    cell: ({ row }) => <span className="tabular-nums">{row.original.order_count.toLocaleString("en-LK")}</span>,
  },
  {
    accessorKey: "units_sold",
    header: "Units sold",
    cell: ({ row }) => <span className="tabular-nums">{formatQuantity(row.original.units_sold, "units")}</span>,
  },
  {
    accessorKey: "average_order_value",
    header: "Average order value",
    cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.average_order_value)}</span>,
  },
  {
    accessorKey: "revenue_share_percentage",
    header: "Revenue share",
    cell: ({ row }) => <span className="tabular-nums">{formatPercent(row.original.revenue_share_percentage)}</span>,
  },
];

export function CollectionAnalyticsDashboard() {
  const searchParams = useSearchParams();
  const selectedPackage = searchParams.get("package");
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
        queryKey: analyticsQueryKey("collection-kpis", chartParams ?? {}),
        queryFn: () => analyticsApi.getCollectionKpis(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("collection-insights", chartParams ?? {}),
        queryFn: () => analyticsApi.getCollectionInsights(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("collection-revenue-trends", chartParams ?? {}),
        queryFn: () => analyticsApi.getCollectionRevenueTrends(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("collection-profit-trends", chartParams ?? {}),
        queryFn: () => analyticsApi.getCollectionProfitTrends(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("collections-top-revenue", chartParams ?? {}),
        queryFn: () => analyticsApi.getTopRevenueCollections(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("collections-top-profit", chartParams ?? {}),
        queryFn: () => analyticsApi.getTopProfitCollections(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("collections-top-volume", chartParams ?? {}),
        queryFn: () => analyticsApi.getTopVolumeCollections(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("collections-top-margin", chartParams ?? {}),
        queryFn: () => analyticsApi.getTopMarginCollections(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("collections-performance", tableParams ?? {}),
        queryFn: () => analyticsApi.getCollectionPerformance(tableParams!),
        enabled: tableParams !== null,
      },
      {
        queryKey: analyticsQueryKey("collection-packages-kpis", chartParams ?? {}),
        queryFn: () => analyticsApi.getCollectionPackageKpis(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("collection-packages-insights", chartParams ?? {}),
        queryFn: () => analyticsApi.getCollectionPackageInsights(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("collection-packages-performance", tableParams ?? {}),
        queryFn: () => analyticsApi.getCollectionPackagePerformance(tableParams!),
        enabled: tableParams !== null,
      },
    ],
  });

  const [
    kpisQuery,
    insightsQuery,
    revenueTrendsQuery,
    profitTrendsQuery,
    topRevenueQuery,
    topProfitQuery,
    topVolumeQuery,
    topMarginQuery,
    performanceQuery,
    packageKpisQuery,
    packageInsightsQuery,
    packagePerformanceQuery,
  ] = queries;

  const kpis = kpisQuery.data;
  const rangeLabel = kpis
    ? formatRangeLabel(kpis.date_range.start_date, kpis.date_range.end_date)
    : undefined;

  const chartGranularity = revenueTrendsQuery.data?.granularity ?? granularity;

  const revenueTrendData = useMemo(() => {
    const points = toTrendPoints(revenueTrendsQuery.data?.points ?? [], "revenue");
    return toAnalyticsChartData(points, chartGranularity);
  }, [revenueTrendsQuery.data, chartGranularity]);

  const profitTrendData = useMemo(() => {
    const points = toTrendPoints(profitTrendsQuery.data?.points ?? [], "profit");
    return toAnalyticsChartData(points, chartGranularity);
  }, [profitTrendsQuery.data, chartGranularity]);

  const topRevenueBar = useMemo(
    () => toCollectionBarData(topRevenueQuery.data?.items ?? [], "revenue"),
    [topRevenueQuery.data],
  );
  const topProfitBar = useMemo(
    () => toCollectionBarData(topProfitQuery.data?.items ?? [], "profit"),
    [topProfitQuery.data],
  );
  const topVolumeBar = useMemo(
    () => toCollectionBarData(topVolumeQuery.data?.items ?? [], "units"),
    [topVolumeQuery.data],
  );
  const marginBar = useMemo(
    () => toCollectionBarData(topMarginQuery.data?.items ?? [], "margin"),
    [topMarginQuery.data],
  );
  const packageRows = useMemo(
    () => packagePerformanceQuery.data?.items ?? [],
    [packagePerformanceQuery.data],
  );
  const packageRevenueBar = useMemo(
    () => toPackageBarData(packageRows, "revenue"),
    [packageRows],
  );
  const packageProfitBar = useMemo(() => toPackageBarData(packageRows, "profit"), [packageRows]);
  const packageOrdersBar = useMemo(() => toPackageBarData(packageRows, "orders"), [packageRows]);
  const packageMarginBar = useMemo(() => toPackageBarData(packageRows, "margin"), [packageRows]);
  const packageRevenueShare = useMemo(() => toPackageRevenueShareData(packageRows), [packageRows]);
  const filteredCollectionRows = useMemo(
    () =>
      (performanceQuery.data?.items ?? []).filter((row) =>
        selectedPackage ? row.package_name === selectedPackage : true,
      ),
    [performanceQuery.data, selectedPackage],
  );

  const formatCurrencyAxis = useCallback((value: number) => formatCurrency(value), []);
  const formatUnits = useCallback((value: number) => formatQuantity(value, "units"), []);
  const formatPercentAxis = useCallback((value: number) => formatPercent(value), []);
  const hasQueryError = queries.some((query) => query.isError);
  const exportUrl = tableParams ? analyticsExportUrl("collections", tableParams) : null;
  const rankingsLoading =
    topRevenueQuery.isLoading ||
    topProfitQuery.isLoading ||
    topVolumeQuery.isLoading ||
    topMarginQuery.isLoading;

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
          Choose a start and end date to load collection analytics.
        </p>
      ) : null}

      {hasQueryError ? (
        <div className="rounded-lg border border-danger/40 bg-surface px-4 py-3 text-sm text-danger">
          Unable to load collection analytics. Check your connection and try again.
        </div>
      ) : null}

      {enabled ? (
        <>
          {kpisQuery.isLoading && !kpis ? (
            <AnalyticsKpiGridSkeleton layout="collection" />
          ) : kpis ? (
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AnalyticsKpiCard
                variant="collections"
                label="Total collection revenue"
                value={formatCurrency(kpis.total_collection_revenue.value)}
                dateRangeLabel={rangeLabel}
                trendPercentage={kpis.total_collection_revenue.trend_percentage}
                trendDirection={kpis.total_collection_revenue.trend_direction}
              />
              <AnalyticsKpiCard
                variant="collections"
                label="Total collection profit"
                value={formatCurrency(kpis.total_collection_profit.value)}
                dateRangeLabel={rangeLabel}
                trendPercentage={kpis.total_collection_profit.trend_percentage}
                trendDirection={kpis.total_collection_profit.trend_direction}
              />
              <AnalyticsKpiCard
                variant="collections"
                label="Collections sold"
                value={formatQuantity(kpis.collections_sold.value, "units")}
                dateRangeLabel={rangeLabel}
                trendPercentage={kpis.collections_sold.trend_percentage}
                trendDirection={kpis.collections_sold.trend_direction}
              />
              <AnalyticsKpiCard
                variant="collections"
                label="Average collection order value"
                value={formatCurrency(kpis.average_collection_order_value.value)}
                dateRangeLabel={rangeLabel}
                trendPercentage={kpis.average_collection_order_value.trend_percentage}
                trendDirection={kpis.average_collection_order_value.trend_direction}
              />
              <AnalyticsKpiCard
                variant="collections"
                label="Average collection margin"
                value={formatPercent(kpis.average_collection_margin_percentage.value)}
                dateRangeLabel={rangeLabel}
                trendPercentage={kpis.average_collection_margin_percentage.trend_percentage}
                trendDirection={kpis.average_collection_margin_percentage.trend_direction}
              />
              <AnalyticsKpiCard
                variant="collections"
                label="Active collections sold"
                value={Number(kpis.active_collections_sold.value).toLocaleString("en-LK")}
                dateRangeLabel={rangeLabel}
                trendPercentage={kpis.active_collections_sold.trend_percentage}
                trendDirection={kpis.active_collections_sold.trend_direction}
              />
            </dl>
          ) : null}

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-text-primary">
                Executive insights
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Snapshot-based collection highlights from order line data.
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
                    entityType="collection"
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border bg-background/50 px-4 py-10 text-center text-sm text-text-secondary">
                Insights will appear once collections are sold in this period.
              </p>
            )}
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <AnalyticsChartCard
              category="collections"
              title="Collection revenue over time"
              description="Revenue from collection line snapshots grouped by order date."
            >
              <AnalyticsLineChart
                category="collections"
                data={revenueTrendData}
                formatValue={formatCurrencyAxis}
                valueLabel="Revenue"
                isLoading={revenueTrendsQuery.isLoading}
                isError={revenueTrendsQuery.isError}
                emptyTitle="No collection sales found in this period"
                emptyDescription="Collection revenue will chart here when orders include collection lines."
              />
            </AnalyticsChartCard>

            <AnalyticsChartCard
              category="collections"
              title="Collection profit over time"
              description="Profit from immutable collection line snapshots."
            >
              <AnalyticsAreaChart
                category="collections"
                data={profitTrendData}
                formatValue={formatCurrencyAxis}
                valueLabel="Profit"
                isLoading={profitTrendsQuery.isLoading}
                isError={profitTrendsQuery.isError}
                emptyTitle="No collection profit in this period"
                emptyDescription="Profit trends use values captured at order placement."
              />
            </AnalyticsChartCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <AnalyticsChartCard
              category="collections"
              title="Top collections by revenue"
              description="Top 10 collections by snapshot revenue."
            >
              <AnalyticsBarChart
                category="collections"
                data={topRevenueBar}
                formatValue={formatCurrencyAxis}
                valueLabel="Revenue"
                isLoading={rankingsLoading}
                isError={topRevenueQuery.isError}
                emptyTitle="No collection sales found in this period"
                emptyDescription="Revenue rankings appear when collection lines exist in orders."
              />
            </AnalyticsChartCard>

            <AnalyticsChartCard
              category="collections"
              title="Top collections by profit"
              description="Top 10 collections by snapshot profit."
            >
              <AnalyticsBarChart
                category="collections"
                data={topProfitBar}
                formatValue={formatCurrencyAxis}
                valueLabel="Profit"
                isLoading={rankingsLoading}
                isError={topProfitQuery.isError}
                emptyTitle="No collection profit data"
                emptyDescription="Profit uses immutable collection line snapshots."
              />
            </AnalyticsChartCard>

            <AnalyticsChartCard
              category="collections"
              title="Top collections by quantity sold"
              description="Top 10 collections by units sold."
            >
              <AnalyticsBarChart
                category="collections"
                data={topVolumeBar}
                formatValue={formatUnits}
                valueLabel="Units"
                isLoading={rankingsLoading}
                isError={topVolumeQuery.isError}
                emptyTitle="No collection sales found in this period"
                emptyDescription="Volume reflects collection line quantities in orders."
              />
            </AnalyticsChartCard>

            <AnalyticsChartCard
              category="collections"
              title="Collection margin comparison"
              description="Top collections by average margin % from snapshots."
            >
              <AnalyticsBarChart
                category="collections"
                data={marginBar}
                layout="horizontal"
                formatValue={formatPercentAxis}
                valueLabel="Margin"
                isLoading={rankingsLoading}
                isError={topMarginQuery.isError}
                emptyTitle="No collection margin data"
                emptyDescription="Margins are calculated from snapshot revenue and profit only."
              />
            </AnalyticsChartCard>
          </div>

          <AnalyticsChartCard
            category="collections"
            title="Collection performance"
            description="All collections sold in the selected period. Click column headers to sort."
          >
            <AnalyticsSortableTable
              columns={collectionColumns}
                data={filteredCollectionRows}
              isLoading={performanceQuery.isLoading}
                emptyMessage={
                  selectedPackage
                    ? `No collection sales found for package "${selectedPackage}" in this period.`
                    : "No collection sales found in this period."
                }
            />
          </AnalyticsChartCard>

          <section className="space-y-4 xl:col-span-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-text-primary">
                Package analytics
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Package-level performance derived from immutable collection order snapshots.
              </p>
            </div>
            {packageKpisQuery.isLoading && !packageKpisQuery.data ? (
              <AnalyticsKpiGridSkeleton layout="collection" />
            ) : packageKpisQuery.data ? (
              <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <AnalyticsKpiCard
                  variant="packages"
                  label={`Highest revenue package (${packageKpisQuery.data.highest_revenue_package.package_name ?? "—"})`}
                  value={formatCurrency(packageKpisQuery.data.highest_revenue_package.value)}
                  dateRangeLabel={rangeLabel}
                />
                <AnalyticsKpiCard
                  variant="packages"
                  label={`Most profitable package (${packageKpisQuery.data.most_profitable_package.package_name ?? "—"})`}
                  value={formatCurrency(packageKpisQuery.data.most_profitable_package.value)}
                  dateRangeLabel={rangeLabel}
                />
                <AnalyticsKpiCard
                  variant="packages"
                  label={`Highest margin package (${packageKpisQuery.data.highest_margin_package.package_name ?? "—"})`}
                  value={formatPercent(packageKpisQuery.data.highest_margin_package.value)}
                  dateRangeLabel={rangeLabel}
                />
                <AnalyticsKpiCard
                  variant="packages"
                  label={`Most ordered package (${packageKpisQuery.data.most_ordered_package.package_name ?? "—"})`}
                  value={Number(packageKpisQuery.data.most_ordered_package.value).toLocaleString("en-LK")}
                  dateRangeLabel={rangeLabel}
                />
                <AnalyticsKpiCard
                  variant="packages"
                  label={`Most sold package (${packageKpisQuery.data.most_sold_package.package_name ?? "—"})`}
                  value={formatQuantity(packageKpisQuery.data.most_sold_package.value, "units")}
                  dateRangeLabel={rangeLabel}
                />
                <AnalyticsKpiCard
                  variant="packages"
                  label="Active package types"
                  value={Number(packageKpisQuery.data.active_package_types.value).toLocaleString("en-LK")}
                  dateRangeLabel={rangeLabel}
                />
              </dl>
            ) : null}

            {packageInsightsQuery.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-36 animate-pulse rounded-xl bg-surface-hover" />
                ))}
              </div>
            ) : packageInsightsQuery.data?.items.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {packageInsightsQuery.data.items.map((insight) => (
                  <AnalyticsInsightCard
                    key={insight.id}
                    title={insight.title}
                    name={insight.name}
                    metricLabel={insight.metric_label}
                    metricValue={insight.metric_value}
                    entityType="package"
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border bg-background/50 px-4 py-10 text-center text-sm text-text-secondary">
                Package insights will appear once package types are sold in this period.
              </p>
            )}

            <div className="grid gap-6 xl:grid-cols-2">
              <AnalyticsChartCard
                category="packages"
                title="Revenue by package"
                description="Snapshot revenue grouped by package type."
              >
                <AnalyticsBarChart
                  category="packages"
                  data={packageRevenueBar}
                  formatValue={formatCurrencyAxis}
                  valueLabel="Revenue"
                  isLoading={packagePerformanceQuery.isLoading}
                  isError={packagePerformanceQuery.isError}
                  emptyTitle="No package revenue in this period"
                  emptyDescription="Revenue appears when collection orders include package-linked collections."
                />
              </AnalyticsChartCard>
              <AnalyticsChartCard
                category="packages"
                title="Profit by package"
                description="Snapshot profit grouped by package type."
              >
                <AnalyticsBarChart
                  category="packages"
                  data={packageProfitBar}
                  formatValue={formatCurrencyAxis}
                  valueLabel="Profit"
                  isLoading={packagePerformanceQuery.isLoading}
                  isError={packagePerformanceQuery.isError}
                  emptyTitle="No package profit in this period"
                  emptyDescription="Profit uses immutable collection line snapshots."
                />
              </AnalyticsChartCard>
              <AnalyticsChartCard
                category="packages"
                title="Orders by package"
                description="Distinct order count by package type."
              >
                <AnalyticsBarChart
                  category="packages"
                  data={packageOrdersBar}
                  formatValue={(value) => value.toLocaleString("en-LK")}
                  valueLabel="Orders"
                  isLoading={packagePerformanceQuery.isLoading}
                  isError={packagePerformanceQuery.isError}
                  emptyTitle="No package orders in this period"
                  emptyDescription="Orders are counted from collection lines per collection type."
                />
              </AnalyticsChartCard>
              <AnalyticsChartCard
                category="packages"
                title="Revenue share by package"
                description="Revenue contribution by package type."
              >
                <AnalyticsDonutChart
                  category="packages"
                  data={packageRevenueShare}
                  formatValue={(value) => formatPercent(value)}
                  isLoading={packagePerformanceQuery.isLoading}
                  isError={packagePerformanceQuery.isError}
                  emptyTitle="No package revenue share available"
                  emptyDescription="Revenue share appears after package sales are recorded."
                />
              </AnalyticsChartCard>
              <AnalyticsChartCard
                category="packages"
                title="Margin comparison"
                description="Average margin % by package type."
                className="xl:col-span-2"
              >
                <AnalyticsBarChart
                  category="packages"
                  data={packageMarginBar}
                  layout="horizontal"
                  formatValue={formatPercentAxis}
                  valueLabel="Margin"
                  isLoading={packagePerformanceQuery.isLoading}
                  isError={packagePerformanceQuery.isError}
                  emptyTitle="No package margin data"
                  emptyDescription="Margins are calculated from snapshot revenue and profit."
                />
              </AnalyticsChartCard>
            </div>

            <AnalyticsChartCard
              category="packages"
              title="Package performance"
              description="Sortable package performance metrics from collection order snapshots."
            >
              <AnalyticsSortableTable
                columns={packageColumns}
                data={packageRows}
                isLoading={packagePerformanceQuery.isLoading}
                emptyMessage="No package performance data found in this period."
              />
            </AnalyticsChartCard>
          </section>
        </>
      ) : null}
    </div>
  );
}
