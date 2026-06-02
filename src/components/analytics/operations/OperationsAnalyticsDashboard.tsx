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
  AnalyticsDonutChart,
  type AnalyticsChartDatum,
  type AnalyticsDonutDatum,
} from "@/components/analytics/charts";
import { OperationsAlertCard } from "@/components/analytics/operations/OperationsAlertCard";
import { UpcomingProductionDemandCard } from "@/components/analytics/production/UpcomingProductionDemandCard";
import { routes } from "@/config/routes";
import {
  analyticsApi,
  analyticsQueryKey,
  buildAnalyticsQueryParams,
  type AnalyticsDatePreset,
  type AnalyticsQueryParams,
  type OperationsExecutiveSummaryRow,
  type OrderDistributionItem,
  type UpcomingProductionDemand,
} from "@/lib/api/analytics";
import { formatCurrency, formatDate, formatQuantity } from "@/lib/format";

const CHART_LIMIT = 10;

function formatRangeLabel(start: string, end: string) {
  return `${formatDate(start)} – ${formatDate(end)}`;
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

const summaryColumns: ColumnDef<OperationsExecutiveSummaryRow>[] = [
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="font-medium text-text-primary">{row.original.category}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="text-text-secondary">{row.original.name}</span>,
  },
  {
    accessorKey: "primary_metric",
    header: "Metric",
    cell: ({ row }) => (
      <span className="tabular-nums text-text-primary">{row.original.primary_metric}</span>
    ),
  },
  {
    accessorKey: "secondary_metric",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-text-muted">{row.original.secondary_metric ?? "—"}</span>
    ),
  },
];

export function OperationsAnalyticsDashboard() {
  const [preset, setPreset] = useState<AnalyticsDatePreset>("last_30_days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const chartParams = useMemo((): AnalyticsQueryParams | null => {
    if (preset === "custom" && (!customStart || !customEnd)) {
      return null;
    }
    return buildAnalyticsQueryParams(preset, customStart, customEnd, "day", CHART_LIMIT);
  }, [preset, customStart, customEnd]);

  const enabled = chartParams !== null;

  const queries = useQueries({
    queries: [
      {
        queryKey: analyticsQueryKey("operations-kpis", chartParams ?? {}),
        queryFn: () => analyticsApi.getOperationsKpis(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("operations-alerts", chartParams ?? {}),
        queryFn: () => analyticsApi.getOperationsAlerts(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("operations-workload", chartParams ?? {}),
        queryFn: () => analyticsApi.getOperationsUpcomingWorkload(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("operations-delivery", chartParams ?? {}),
        queryFn: () => analyticsApi.getOperationsDeliveryOverview(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("operations-payment", chartParams ?? {}),
        queryFn: () => analyticsApi.getOperationsPaymentOverview(chartParams!),
        enabled,
      },
      {
        queryKey: analyticsQueryKey("operations-health", chartParams ?? {}),
        queryFn: () => analyticsApi.getOperationsBusinessHealth(chartParams!),
        enabled,
      },
    ],
  });

  const [
    kpisQuery,
    alertsQuery,
    workloadQuery,
    deliveryQuery,
    paymentQuery,
    healthQuery,
  ] = queries;

  const kpis = kpisQuery.data;
  const rangeLabel = kpis
    ? formatRangeLabel(kpis.date_range.start_date, kpis.date_range.end_date)
    : undefined;

  const deliveryAreaBar = useMemo(
    () => toBarData(deliveryQuery.data?.deliveries_by_area ?? []),
    [deliveryQuery.data],
  );

  const upcomingDeliveryBar = useMemo((): AnalyticsChartDatum[] => {
    return (deliveryQuery.data?.upcoming_by_date ?? []).map((row) => ({
      label: formatDate(row.delivery_date),
      value: row.order_count,
    }));
  }, [deliveryQuery.data]);

  const deliveryFeeBar = useMemo((): AnalyticsChartDatum[] => {
    return (deliveryQuery.data?.delivery_fee_by_area ?? []).map((row) => ({
      label: truncateLabel(row.area_name),
      value: Number(row.delivery_fee_revenue),
    }));
  }, [deliveryQuery.data]);

  const paymentMethodDonut = useMemo(
    () => toDonutData(paymentQuery.data?.payment_methods ?? []),
    [paymentQuery.data],
  );
  const paymentStatusDonut = useMemo(
    () => toDonutData(paymentQuery.data?.payment_statuses ?? []),
    [paymentQuery.data],
  );

  const upcomingDemand = useMemo((): UpcomingProductionDemand | undefined => {
    const workload = workloadQuery.data;
    if (!workload?.has_upcoming_batch) {
      return undefined;
    }
    return {
      has_upcoming_batch: true,
      delivery_date: workload.delivery_date,
      order_count: workload.orders_scheduled,
      collection_count: workload.collections_scheduled,
      product_count: String(workload.products_required.length),
      top_ingredients: workload.top_ingredients,
      top_packaging: workload.top_packaging,
    };
  }, [workloadQuery.data]);

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
      </div>

      <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
        Executive overview of revenue, fulfillment, deliveries, payments, and upcoming
        production workload. Upcoming delivery and workload sections use scheduled delivery
        dates from today forward, independent of the selected period filter.
      </div>

      <AnalyticsDateRangeControls
        preset={preset}
        customStart={customStart}
        customEnd={customEnd}
        onPresetChange={setPreset}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
      />

      {hasQueryError ? (
        <p className="text-sm text-red-600">
          Some operations metrics could not be loaded. Try refreshing the page.
        </p>
      ) : null}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Executive KPIs
        </h2>
        {kpisQuery.isLoading || !kpis ? (
          <div className="mt-4">
            <AnalyticsKpiGridSkeleton layout="operations" />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnalyticsKpiCard
              variant="revenue"
              label="Revenue this period"
              value={formatCurrency(kpis.revenue_this_period.value)}
              dateRangeLabel={rangeLabel}
            />
            <AnalyticsKpiCard
              variant="profit"
              label="Profit this period"
              value={formatCurrency(kpis.profit_this_period.value)}
              dateRangeLabel={rangeLabel}
            />
            <AnalyticsKpiCard
              variant="orders"
              label="Orders this period"
              value={Number(kpis.orders_this_period.value).toLocaleString("en-LK")}
              dateRangeLabel={rangeLabel}
            />
            <AnalyticsKpiCard
              variant="operations"
              label="Upcoming deliveries"
              value={Number(kpis.upcoming_deliveries.value).toLocaleString("en-LK")}
            />
            <AnalyticsKpiCard
              variant="customers"
              label="Active customers"
              value={Number(kpis.active_customers.value).toLocaleString("en-LK")}
              dateRangeLabel={rangeLabel}
            />
            <AnalyticsKpiCard
              variant="production"
              label="Production workload"
              value={Number(kpis.production_workload.value).toLocaleString("en-LK")}
            />
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Operational alerts
        </h2>
        {alertsQuery.isLoading ? (
          <div className="mt-4 h-24 animate-pulse rounded-xl bg-surface-hover" />
        ) : alertsQuery.data?.items.length ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {alertsQuery.data.items.map((alert) => (
              <OperationsAlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-text-muted">
            No operational alerts right now. Order pipeline and purchase planning look clear.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Upcoming workload
        </h2>
        <div className="mt-4 space-y-4">
          <UpcomingProductionDemandCard
            data={upcomingDemand}
            isLoading={workloadQuery.isLoading}
          />
          {workloadQuery.data?.has_upcoming_batch &&
          workloadQuery.data.products_required.length > 0 ? (
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Products required (next batch)
              </h3>
              <ul className="mt-3 divide-y divide-border rounded-md border border-border">
                {workloadQuery.data.products_required.map((line) => (
                  <li
                    key={line.product_name}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <span>{line.product_name}</span>
                    <span className="tabular-nums text-text-secondary">
                      {formatQuantity(line.quantity, "units")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : !workloadQuery.isLoading && !workloadQuery.data?.has_upcoming_batch ? (
            <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-text-muted">
              No upcoming deliveries scheduled.
            </p>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Delivery overview
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <AnalyticsChartCard
            title="Deliveries by area"
            category="operations"
            description="Orders in the selected period by delivery area."
          >
            <AnalyticsBarChart
              data={deliveryAreaBar}
              category="operations"
              isLoading={deliveryQuery.isLoading}
              emptyTitle="No delivery area data"
              emptyDescription="No delivery area data for this period."
            />
          </AnalyticsChartCard>
          <AnalyticsChartCard
            title="Upcoming deliveries by date"
            category="operations"
            description="Scheduled delivery dates from today forward."
          >
            <AnalyticsBarChart
              data={upcomingDeliveryBar}
              category="operations"
              isLoading={deliveryQuery.isLoading}
              emptyTitle="No upcoming deliveries"
              emptyDescription="No upcoming deliveries scheduled."
            />
          </AnalyticsChartCard>
          <AnalyticsChartCard
            title="Delivery fee revenue by area"
            category="operations"
            description="Delivery fee snapshot totals in the selected period."
          >
            <AnalyticsBarChart
              data={deliveryFeeBar}
              category="operations"
              formatValue={(value) => formatCurrency(String(value))}
              isLoading={deliveryQuery.isLoading}
              emptyTitle="No delivery fee revenue"
              emptyDescription="No delivery fee revenue in this period."
            />
          </AnalyticsChartCard>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Payment overview
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <AnalyticsChartCard
            title="Payment methods"
            category="operations"
            description="How customers paid in the selected period."
          >
            <AnalyticsDonutChart
              data={paymentMethodDonut}
              category="operations"
              isLoading={paymentQuery.isLoading}
              emptyTitle="No payment methods"
              emptyDescription="No payment method data for this period."
            />
          </AnalyticsChartCard>
          <AnalyticsChartCard
            title="Payment statuses"
            category="operations"
            description="Payment lifecycle from order snapshots."
          >
            <AnalyticsDonutChart
              data={paymentStatusDonut}
              category="operations"
              isLoading={paymentQuery.isLoading}
              emptyTitle="No payment statuses"
              emptyDescription="No payment status data for this period."
            />
          </AnalyticsChartCard>
        </div>
        {paymentQuery.data ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <article className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Outstanding payment value
              </p>
              <p className="mt-2 text-xl font-semibold tabular-nums">
                {formatCurrency(paymentQuery.data.outstanding_payment_value)}
              </p>
            </article>
            <article className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Paid revenue
              </p>
              <p className="mt-2 text-xl font-semibold tabular-nums">
                {formatCurrency(paymentQuery.data.paid_revenue)}
              </p>
            </article>
            <article className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                Unpaid revenue
              </p>
              <p className="mt-2 text-xl font-semibold tabular-nums">
                {formatCurrency(paymentQuery.data.unpaid_revenue)}
              </p>
            </article>
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Business health
        </h2>
        {healthQuery.isLoading ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-xl bg-surface-hover" />
            ))}
          </div>
        ) : healthQuery.data?.highlights.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {healthQuery.data.highlights.map((item) => (
              <AnalyticsInsightCard
                key={item.id}
                title={item.title}
                name={item.name}
                metricLabel={item.metric_label}
                metricValue={item.metric_value}
                entityType={
                  item.id.includes("product")
                    ? "product"
                    : item.id.includes("collection")
                      ? "collection"
                      : item.id.includes("customer")
                        ? "customer"
                        : item.id.includes("batch")
                          ? "production"
                          : "operations"
                }
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-text-muted">No business health highlights available.</p>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Executive summary
        </h2>
        <div className="mt-4">
          <AnalyticsSortableTable
            columns={summaryColumns}
            data={healthQuery.data?.summary_rows ?? []}
            isLoading={healthQuery.isLoading}
            emptyMessage="No summary data for this period."
          />
        </div>
      </section>
    </div>
  );
}
