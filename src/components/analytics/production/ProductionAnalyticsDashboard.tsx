"use client";

import { useQuery, useQueries } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { AnalyticsDateRangeControls } from "@/components/analytics/AnalyticsDateRangeControls";
import { AnalyticsInfoNotice } from "@/components/analytics/AnalyticsInfoNotice";
import { AnalyticsGranularityToggle } from "@/components/analytics/AnalyticsGranularityToggle";
import { PRODUCTION_ANALYTICS_DATE_PRESETS } from "@/components/analytics/production/production-analytics-presets";
import { buildProductionChartEmptyDescription } from "@/components/analytics/production/production-empty-state";
import { UpcomingProductionDemandCard } from "@/components/analytics/production/UpcomingProductionDemandCard";
import { AnalyticsInsightCard } from "@/components/analytics/AnalyticsInsightCard";
import { AnalyticsKpiCard, AnalyticsKpiGridSkeleton } from "@/components/analytics/AnalyticsKpiCard";
import { AnalyticsSortableTable } from "@/components/analytics/AnalyticsSortableTable";
import {
  AnalyticsBarChart,
  AnalyticsChartCard,
  AnalyticsLineChart,
  formatPeriodLabel,
  type AnalyticsChartDatum,
} from "@/components/analytics/charts";
import { routes } from "@/config/routes";
import {
  analyticsApi,
  analyticsQueryKey,
  buildAnalyticsQueryParams,
  type AnalyticsDatePreset,
  type AnalyticsQueryParams,
  type ProductionDemandItem,
  type TrendGranularity,
} from "@/lib/api/analytics";
import { formatCurrency, formatDate, formatQuantity } from "@/lib/format";

const CHART_LIMIT = 10;
const TABLE_LIMIT = 100;

function formatRangeLabel(start: string, end: string) {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function truncateLabel(label: string, maxLength = 18): string {
  if (label.length <= maxLength) {
    return label;
  }
  return `${label.slice(0, maxLength - 1)}…`;
}

function toDemandBarData(items: ProductionDemandItem[]): AnalyticsChartDatum[] {
  return items.map((item) => ({
    label: truncateLabel(item.item_name),
    value: Number(item.total_quantity) || 0,
  }));
}

const ingredientColumns: ColumnDef<ProductionDemandItem>[] = [
  {
    accessorKey: "item_name",
    header: "Ingredient",
    cell: ({ row }) => (
      <span className="font-medium text-text-primary">{row.original.item_name}</span>
    ),
  },
  {
    accessorKey: "total_quantity",
    header: "Total quantity",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatQuantity(row.original.total_quantity, row.original.unit)}
      </span>
    ),
  },
  {
    accessorKey: "unit",
    header: "Unit",
    cell: ({ row }) => <span className="text-text-secondary">{row.original.unit}</span>,
  },
  {
    accessorKey: "estimated_cost",
    header: "Estimated cost",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCurrency(row.original.estimated_cost)}</span>
    ),
  },
  {
    accessorKey: "last_used_date",
    header: "Last used",
    cell: ({ row }) =>
      row.original.last_used_date ? formatDate(row.original.last_used_date) : "—",
  },
];

const packagingColumns: ColumnDef<ProductionDemandItem>[] = [
  {
    accessorKey: "item_name",
    header: "Packaging item",
    cell: ({ row }) => (
      <span className="font-medium text-text-primary">{row.original.item_name}</span>
    ),
  },
  {
    accessorKey: "total_quantity",
    header: "Total quantity",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatQuantity(row.original.total_quantity, row.original.unit)}
      </span>
    ),
  },
  {
    accessorKey: "unit",
    header: "Unit",
    cell: ({ row }) => <span className="text-text-secondary">{row.original.unit}</span>,
  },
  {
    accessorKey: "estimated_cost",
    header: "Estimated cost",
    cell: ({ row }) => (
      <span className="tabular-nums">{formatCurrency(row.original.estimated_cost)}</span>
    ),
  },
  {
    accessorKey: "last_used_date",
    header: "Last used",
    cell: ({ row }) =>
      row.original.last_used_date ? formatDate(row.original.last_used_date) : "—",
  },
];

export function ProductionAnalyticsDashboard() {
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

  const upcomingQuery = useQuery({
    queryKey: ["analytics", "production-upcoming"],
    queryFn: () => analyticsApi.getProductionUpcoming(),
  });

  const hintQuery = useQuery({
    queryKey: analyticsQueryKey("production-out-of-range", chartParams ?? {}),
    queryFn: () => analyticsApi.getProductionOutOfRangeHint(chartParams!),
    enabled,
  });

  const queries = useQueries({
    queries: [
      {
        queryKey: analyticsQueryKey("production-kpis", chartParams ?? {}),
        queryFn: () => analyticsApi.getProductionKpis(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("production-insights", chartParams ?? {}),
        queryFn: () => analyticsApi.getProductionInsights(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("production-volume", chartParams ?? {}),
        queryFn: () => analyticsApi.getProductionVolume(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("production-ingredients-chart", chartParams ?? {}),
        queryFn: () => analyticsApi.getProductionIngredientSummary(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("production-packaging-chart", chartParams ?? {}),
        queryFn: () => analyticsApi.getProductionPackagingSummary(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("production-batch-trends", chartParams ?? {}),
        queryFn: () => analyticsApi.getProductionBatchTrends(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("production-ingredients-table", tableParams ?? {}),
        queryFn: () => analyticsApi.getProductionIngredientSummary(tableParams!),
        enabled: tableParams !== null,
      },
      {
        queryKey: analyticsQueryKey("production-packaging-table", tableParams ?? {}),
        queryFn: () => analyticsApi.getProductionPackagingSummary(tableParams!),
        enabled: tableParams !== null,
      },
    ],
  });

  const [
    kpisQuery,
    insightsQuery,
    volumeQuery,
    ingredientChartQuery,
    packagingChartQuery,
    batchQuery,
    ingredientTableQuery,
    packagingTableQuery,
  ] = queries;

  const kpis = kpisQuery.data;
  const rangeLabel = kpis
    ? formatRangeLabel(kpis.date_range.start_date, kpis.date_range.end_date)
    : undefined;

  const chartGranularity = volumeQuery.data?.granularity ?? granularity;

  const volumeChartData = useMemo((): AnalyticsChartDatum[] => {
    return (volumeQuery.data?.points ?? []).map((point) => {
      const products = Number(point.total_products) || 0;
      const collections = Number(point.total_collections) || 0;
      return {
        label: formatPeriodLabel(point.period_start, chartGranularity),
        value: products + collections,
      };
    });
  }, [volumeQuery.data, chartGranularity]);

  const ingredientBarData = useMemo(
    () => toDemandBarData(ingredientChartQuery.data?.items ?? []),
    [ingredientChartQuery.data],
  );

  const packagingBarData = useMemo(
    () => toDemandBarData(packagingChartQuery.data?.items ?? []),
    [packagingChartQuery.data],
  );

  const batchBarData = useMemo((): AnalyticsChartDatum[] => {
    return (batchQuery.data?.points ?? []).map((point) => ({
      label: formatDate(point.delivery_date),
      value: point.order_count,
    }));
  }, [batchQuery.data]);

  const formatVolume = useCallback((value: number) => value.toLocaleString("en-LK"), []);
  const formatOrders = useCallback((value: number) => value.toLocaleString("en-LK"), []);

  const outOfRangeHint = hintQuery.data;
  const upcoming = upcomingQuery.data;

  const volumeEmptyDescription = useMemo(
    () =>
      buildProductionChartEmptyDescription(
        "Place orders with delivery dates in range to see production demand over time.",
        outOfRangeHint,
      ),
    [outOfRangeHint],
  );
  const ingredientEmptyDescription = useMemo(
    () =>
      buildProductionChartEmptyDescription(
        "Configure product recipes and schedule orders to see ingredient demand.",
        outOfRangeHint,
      ),
    [outOfRangeHint],
  );
  const packagingEmptyDescription = useMemo(
    () =>
      buildProductionChartEmptyDescription(
        "Configure collection packaging and schedule orders to see packaging demand.",
        outOfRangeHint,
      ),
    [outOfRangeHint],
  );
  const batchEmptyDescription = useMemo(
    () =>
      buildProductionChartEmptyDescription(
        "Orders with scheduled delivery dates will appear as production batches.",
        outOfRangeHint,
      ),
    [outOfRangeHint],
  );

  const hasQueryError =
    queries.some((query) => query.isError) ||
    upcomingQuery.isError ||
    hintQuery.isError;

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
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={routes.production}
            className="text-sm font-medium text-primary hover:underline"
          >
            View Production Planning
          </Link>
          <AnalyticsGranularityToggle value={granularity} onChange={setGranularity} />
        </div>
      </div>

      <AnalyticsDateRangeControls
        preset={preset}
        customStart={customStart}
        customEnd={customEnd}
        onPresetChange={setPreset}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
        resolvedRange={kpis?.date_range}
        presets={PRODUCTION_ANALYTICS_DATE_PRESETS}
      />

      <AnalyticsInfoNotice>
        <p>
          Production Analytics uses scheduled delivery dates, not order creation dates.
        </p>
        <p>
          Upcoming deliveries outside the selected range will not appear in these metrics.
        </p>
      </AnalyticsInfoNotice>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-text-primary">
            Operational snapshot
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Next scheduled delivery batch — independent of the historical date range below.
          </p>
        </div>
        {upcomingQuery.isLoading && !upcoming ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-xl border border-border bg-surface-hover"
              />
            ))}
          </div>
        ) : (
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AnalyticsKpiCard
              variant="production"
              label="Upcoming orders"
              value={
                upcoming?.has_upcoming_batch
                  ? upcoming.order_count.toLocaleString("en-LK")
                  : "—"
              }
            />
            <AnalyticsKpiCard
              variant="production"
              label="Upcoming collections"
              value={
                upcoming?.has_upcoming_batch
                  ? Number(upcoming.collection_count).toLocaleString("en-LK")
                  : "—"
              }
            />
            <AnalyticsKpiCard
              variant="production"
              label="Upcoming product units"
              value={
                upcoming?.has_upcoming_batch
                  ? Number(upcoming.product_count).toLocaleString("en-LK")
                  : "—"
              }
            />
            <AnalyticsKpiCard
              variant="production"
              label="Next delivery date"
              value={
                upcoming?.delivery_date ? formatDate(upcoming.delivery_date) : "—"
              }
            />
          </dl>
        )}
      </section>

      <UpcomingProductionDemandCard
        data={upcoming}
        isLoading={upcomingQuery.isLoading}
      />

      {!enabled ? (
        <p className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-sm text-text-secondary">
          Choose a start and end date to load production analytics.
        </p>
      ) : null}

      {hasQueryError ? (
        <div className="rounded-lg border border-danger/40 bg-surface px-4 py-3 text-sm text-danger">
          Unable to load production analytics. Check your connection and try again.
        </div>
      ) : null}

      {enabled ? (
        <>
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-text-primary">
                Historical metrics
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Totals for scheduled deliveries within the selected date range.
              </p>
            </div>
          {kpisQuery.isLoading && !kpis ? (
            <AnalyticsKpiGridSkeleton layout="production" />
          ) : kpis ? (
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AnalyticsKpiCard
                variant="production"
                label="Total products produced"
                value={formatQuantity(kpis.total_products_produced, "units")}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="production"
                label="Total collections produced"
                value={formatQuantity(kpis.total_collections_produced, "units")}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="production"
                label="Total ingredient consumption"
                value={formatCurrency(kpis.total_ingredient_consumption_cost)}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="production"
                label="Total packaging consumption"
                value={formatCurrency(kpis.total_packaging_consumption_cost)}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="production"
                label="Total production batches"
                value={kpis.total_production_batches.toLocaleString("en-LK")}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="production"
                label="Average batch size"
                value={Number(kpis.average_batch_size).toLocaleString("en-LK", {
                  maximumFractionDigits: 1,
                })}
                dateRangeLabel={rangeLabel}
              />
            </dl>
          ) : null}
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-text-primary">
                Operational insights
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Demand highlights from production planning and delivery batches.
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
                    entityType="production"
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border bg-background/50 px-4 py-10 text-center text-sm text-text-secondary">
                Insights will appear once you have scheduled orders and production plans in this
                period.
              </p>
            )}
          </section>

          <AnalyticsChartCard
            category="production"
            title="Production volume over time"
            description="Combined product and collection units planned per period from order snapshots."
          >
            <AnalyticsLineChart
              category="production"
              data={volumeChartData}
              formatValue={formatVolume}
              valueLabel="Units produced"
              isLoading={volumeQuery.isLoading}
              isError={volumeQuery.isError}
              emptyTitle="No production volume in this period"
              emptyDescription={volumeEmptyDescription}
            />
          </AnalyticsChartCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <AnalyticsChartCard
              category="production"
              title="Most consumed ingredients"
              description="Top ingredients by total quantity consumed across delivery batches."
            >
              <AnalyticsBarChart
                category="production"
                data={ingredientBarData}
                formatValue={formatVolume}
                valueLabel="Quantity"
                isLoading={ingredientChartQuery.isLoading}
                isError={ingredientChartQuery.isError}
                emptyTitle="No ingredient consumption data"
                emptyDescription={ingredientEmptyDescription}
              />
            </AnalyticsChartCard>

            <AnalyticsChartCard
              category="production"
              title="Most consumed packaging items"
              description="Top packaging materials by total quantity consumed across delivery batches."
            >
              <AnalyticsBarChart
                category="production"
                data={packagingBarData}
                formatValue={formatVolume}
                valueLabel="Quantity"
                isLoading={packagingChartQuery.isLoading}
                isError={packagingChartQuery.isError}
                emptyTitle="No packaging consumption data"
                emptyDescription={packagingEmptyDescription}
              />
            </AnalyticsChartCard>
          </div>

          <AnalyticsChartCard
            category="production"
            title="Production batch volume"
            description="Orders per delivery date — helps identify busy production weeks."
          >
            <AnalyticsBarChart
              category="production"
              data={batchBarData}
              formatValue={formatOrders}
              valueLabel="Orders"
              isLoading={batchQuery.isLoading}
              isError={batchQuery.isError}
              emptyTitle="No delivery batches in this period"
              emptyDescription={batchEmptyDescription}
            />
          </AnalyticsChartCard>

          <AnalyticsChartCard
            category="production"
            title="Ingredient analytics"
            description="Aggregated ingredient demand from production planning for the selected range."
          >
            <AnalyticsSortableTable
              columns={ingredientColumns}
              data={ingredientTableQuery.data?.items ?? []}
              isLoading={ingredientTableQuery.isLoading}
              emptyMessage="No ingredient consumption in this period."
            />
          </AnalyticsChartCard>

          <AnalyticsChartCard
            category="production"
            title="Packaging analytics"
            description="Aggregated packaging demand from collection packaging rules and orders."
          >
            <AnalyticsSortableTable
              columns={packagingColumns}
              data={packagingTableQuery.data?.items ?? []}
              isLoading={packagingTableQuery.isLoading}
              emptyMessage="No packaging consumption in this period."
            />
          </AnalyticsChartCard>
        </>
      ) : null}
    </div>
  );
}
