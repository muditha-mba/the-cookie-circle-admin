"use client";

import { useQueries } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { AnalyticsDateRangeControls } from "@/components/analytics/AnalyticsDateRangeControls";
import { AnalyticsInsightCard } from "@/components/analytics/AnalyticsInsightCard";
import { AnalyticsKpiCard, AnalyticsKpiGridSkeleton } from "@/components/analytics/AnalyticsKpiCard";
import { AnalyticsSortableTable } from "@/components/analytics/AnalyticsSortableTable";
import {
  AnalyticsBarChart,
  AnalyticsChartCard,
  type AnalyticsChartDatum,
} from "@/components/analytics/charts";
import { routes } from "@/config/routes";
import {
  analyticsApi,
  analyticsQueryKey,
  buildAnalyticsQueryParams,
  type AnalyticsDatePreset,
  type AnalyticsQueryParams,
  type CollectionAnalyticsRow,
  type ProductAnalyticsRow,
} from "@/lib/api/analytics";
import { formatCurrency, formatDate, formatPercent, formatQuantity } from "@/lib/format";

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

function toBarChartData(
  items: { name: string; units_sold: string; profit_snapshot: string }[],
  field: "units" | "profit",
): AnalyticsChartDatum[] {
  return items.map((item) => ({
    label: truncateLabel(item.name),
    value:
      field === "units"
        ? Number(item.units_sold) || 0
        : Number(item.profit_snapshot) || 0,
  }));
}

const productColumns: ColumnDef<ProductAnalyticsRow>[] = [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <span className="font-medium text-text-primary">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "units_sold",
    header: "Quantity sold",
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
    accessorKey: "last_sold_date",
    header: "Last sold",
    cell: ({ row }) =>
      row.original.last_sold_date ? formatDate(row.original.last_sold_date) : "—",
  },
];

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
    accessorKey: "units_sold",
    header: "Quantity sold",
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
    accessorKey: "last_sold_date",
    header: "Last sold",
    cell: ({ row }) =>
      row.original.last_sold_date ? formatDate(row.original.last_sold_date) : "—",
  },
];

export function ProductAnalyticsDashboard() {
  const [preset, setPreset] = useState<AnalyticsDatePreset>("last_30_days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const chartParams = useMemo((): AnalyticsQueryParams | null => {
    if (preset === "custom" && (!customStart || !customEnd)) {
      return null;
    }
    return buildAnalyticsQueryParams(preset, customStart, customEnd, "day", CHART_LIMIT);
  }, [preset, customStart, customEnd]);

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
        queryKey: analyticsQueryKey("product-kpis", chartParams ?? {}),
        queryFn: () => analyticsApi.getProductKpis(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("product-insights", chartParams ?? {}),
        queryFn: () => analyticsApi.getProductInsights(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("products-most-ordered", chartParams ?? {}),
        queryFn: () => analyticsApi.getMostOrderedProducts(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("products-most-profitable", chartParams ?? {}),
        queryFn: () => analyticsApi.getMostProfitableProducts(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("collections-most-ordered", chartParams ?? {}),
        queryFn: () => analyticsApi.getMostOrderedCollections(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("collections-most-profitable", chartParams ?? {}),
        queryFn: () => analyticsApi.getMostProfitableCollections(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("products-performance", tableParams ?? {}),
        queryFn: () => analyticsApi.getProductPerformance(tableParams!),
        enabled: tableParams !== null,
      },
      {
        queryKey: analyticsQueryKey("collections-performance", tableParams ?? {}),
        queryFn: () => analyticsApi.getCollectionPerformance(tableParams!),
        enabled: tableParams !== null,
      },
    ],
  });

  const [
    kpisQuery,
    insightsQuery,
    productsOrderedQuery,
    productsProfitQuery,
    collectionsOrderedQuery,
    collectionsProfitQuery,
    productTableQuery,
    collectionTableQuery,
  ] = queries;

  const kpis = kpisQuery.data;
  const insights = insightsQuery.data;
  const rangeLabel = kpis
    ? formatRangeLabel(kpis.date_range.start_date, kpis.date_range.end_date)
    : undefined;
  const resolvedRange = kpis?.date_range;

  const hasQueryError = queries.some((query) => query.isError);
  const chartsLoading =
    productsOrderedQuery.isLoading ||
    productsProfitQuery.isLoading ||
    collectionsOrderedQuery.isLoading ||
    collectionsProfitQuery.isLoading;

  const productsByQuantity = useMemo(
    () => toBarChartData(productsOrderedQuery.data?.items ?? [], "units"),
    [productsOrderedQuery.data],
  );
  const productsByProfit = useMemo(
    () => toBarChartData(productsProfitQuery.data?.items ?? [], "profit"),
    [productsProfitQuery.data],
  );
  const collectionsByQuantity = useMemo(
    () => toBarChartData(collectionsOrderedQuery.data?.items ?? [], "units"),
    [collectionsOrderedQuery.data],
  );
  const collectionsByProfit = useMemo(
    () => toBarChartData(collectionsProfitQuery.data?.items ?? [], "profit"),
    [collectionsProfitQuery.data],
  );

  const formatUnits = (value: number) => formatQuantity(value, "units");
  const formatProfit = (value: number) => formatCurrency(value);

  return (
    <div className="space-y-8">
      <Link
        href={routes.analytics.home}
        className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Analytics
      </Link>

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
          Choose a start and end date to load product analytics.
        </p>
      ) : null}

      {hasQueryError ? (
        <div className="rounded-lg border border-danger/40 bg-surface px-4 py-3 text-sm text-danger">
          Unable to load product analytics. Check your connection and try again.
        </div>
      ) : null}

      {enabled ? (
        <>
          {kpisQuery.isLoading && !kpis ? (
            <AnalyticsKpiGridSkeleton layout="product" />
          ) : kpis ? (
            <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AnalyticsKpiCard
                variant="products"
                label="Most ordered product"
                value={kpis.most_ordered_product_name ?? "—"}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="products"
                label="Most profitable product"
                value={kpis.most_profitable_product_name ?? "—"}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="customers"
                label="Most ordered collection"
                value={kpis.most_ordered_collection_name ?? "—"}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="customers"
                label="Most profitable collection"
                value={kpis.most_profitable_collection_name ?? "—"}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="products"
                label="Total products sold"
                value={formatQuantity(kpis.total_products_sold, "units")}
                dateRangeLabel={rangeLabel}
              />
              <AnalyticsKpiCard
                variant="customers"
                label="Total collections sold"
                value={formatQuantity(kpis.total_collections_sold, "units")}
                dateRangeLabel={rangeLabel}
              />
            </dl>
          ) : null}

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-text-primary">
                Executive insights
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Snapshot-based highlights to guide product and collection strategy.
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
            ) : insights?.items.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {insights.items.map((insight) => (
                  <AnalyticsInsightCard
                    key={insight.id}
                    title={insight.title}
                    name={insight.name}
                    metricLabel={insight.metric_label}
                    metricValue={insight.metric_value}
                    entityType={insight.entity_type}
                  />
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border bg-background/50 px-4 py-10 text-center text-sm text-text-secondary">
                Insights will appear once products or collections are sold in this period.
              </p>
            )}
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <AnalyticsChartCard
              category="products"
              title="Top products by quantity sold"
              description="Top 10 products by units sold (order line snapshots)."
            >
              <AnalyticsBarChart
                category="products"
                data={productsByQuantity}
                formatValue={formatUnits}
                valueLabel="Units"
                isLoading={chartsLoading}
                isError={productsOrderedQuery.isError}
                emptyTitle="No product sales in this period"
                emptyDescription="Product volume will chart here when orders include product lines."
              />
            </AnalyticsChartCard>

            <AnalyticsChartCard
              category="products"
              title="Top products by profit"
              description="Top 10 products by snapshot profit."
            >
              <AnalyticsBarChart
                category="products"
                data={productsByProfit}
                formatValue={formatProfit}
                valueLabel="Profit"
                isLoading={chartsLoading}
                isError={productsProfitQuery.isError}
                emptyTitle="No product profit data"
                emptyDescription="Profit rankings use values captured at order placement."
              />
            </AnalyticsChartCard>

            <AnalyticsChartCard
              category="customers"
              title="Top collections by quantity sold"
              description="Top 10 collections by units sold."
            >
              <AnalyticsBarChart
                category="customers"
                data={collectionsByQuantity}
                formatValue={formatUnits}
                valueLabel="Units"
                isLoading={chartsLoading}
                isError={collectionsOrderedQuery.isError}
                emptyTitle="No collection sales in this period"
                emptyDescription="Collection volume will appear when orders include collections."
              />
            </AnalyticsChartCard>

            <AnalyticsChartCard
              category="customers"
              title="Top collections by profit"
              description="Top 10 collections by snapshot profit."
            >
              <AnalyticsBarChart
                category="customers"
                data={collectionsByProfit}
                formatValue={formatProfit}
                valueLabel="Profit"
                isLoading={chartsLoading}
                isError={collectionsProfitQuery.isError}
                emptyTitle="No collection profit data"
                emptyDescription="Profit uses immutable collection line snapshots."
              />
            </AnalyticsChartCard>
          </div>

          <AnalyticsChartCard
            category="products"
            title="Product performance"
            description="All products sold in the selected period. Click column headers to sort."
          >
            <AnalyticsSortableTable
              columns={productColumns}
              data={productTableQuery.data?.items ?? []}
              isLoading={productTableQuery.isLoading}
              emptyMessage="No products sold in this period."
            />
          </AnalyticsChartCard>

          <AnalyticsChartCard
            category="customers"
            title="Collection performance"
            description="All collections sold in the selected period. Click column headers to sort."
          >
            <AnalyticsSortableTable
              columns={collectionColumns}
              data={collectionTableQuery.data?.items ?? []}
              isLoading={collectionTableQuery.isLoading}
              emptyMessage="No collections sold in this period."
            />
          </AnalyticsChartCard>
        </>
      ) : null}
    </div>
  );
}
