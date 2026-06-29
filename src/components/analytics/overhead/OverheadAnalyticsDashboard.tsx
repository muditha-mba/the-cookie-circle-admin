"use client";

import { useQueries } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AnalyticsKpiCard } from "@/components/analytics/AnalyticsKpiCard";
import {
  AnalyticsBarChart,
  AnalyticsChartCard,
  AnalyticsLineChart,
  toAnalyticsChartData,
} from "@/components/analytics/charts";
import { DataTable } from "@/components/data/DataTable";
import { SectionCard } from "@/components/production/shared";
import { routes } from "@/config/routes";
import type { OverheadCategoryRow, OverheadMonthlyRow } from "@/lib/api/analytics";
import { analyticsApi } from "@/lib/api/analytics";
import { MONTH_NAMES } from "@/lib/format";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const categoryColumns: ColumnDef<OverheadCategoryRow>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => (
      <span className="font-medium text-text-primary">{row.original.name}</span>
    ),
  },
  {
    header: "Type",
    accessorKey: "category",
    cell: ({ row }) => (
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
          row.original.category === "utility"
            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            : "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        )}
      >
        {row.original.category}
      </span>
    ),
  },
  {
    header: "Entries",
    accessorKey: "entry_count",
    cell: ({ row }) => row.original.entry_count,
  },
  {
    header: "Total",
    accessorKey: "total",
    cell: ({ row }) => (
      <span className="tabular-nums font-medium">{formatCurrency(row.original.total)}</span>
    ),
  },
];

export function OverheadAnalyticsDashboard() {
  const [year, setYear] = useState(CURRENT_YEAR);

  const [kpisQuery, monthlyQuery, categoryQuery] = useQueries({
    queries: [
      {
        queryKey: ["analytics", "overhead-kpis", year],
        queryFn: () => analyticsApi.getOverheadKpis(year),
      },
      {
        queryKey: ["analytics", "overhead-monthly", year],
        queryFn: () => analyticsApi.getOverheadMonthlyBreakdown(year),
      },
      {
        queryKey: ["analytics", "overhead-category", year],
        queryFn: () => analyticsApi.getOverheadCategoryBreakdown(year),
      },
    ],
  });

  const kpis = kpisQuery.data;
  const monthly = monthlyQuery.data ?? [];
  const categories = categoryQuery.data ?? [];

  const isLoading = kpisQuery.isLoading || monthlyQuery.isLoading;

  // Chart data helpers
  const utilityChartData = toAnalyticsChartData(
    monthly.map((r) => ({ periodStart: monthLabel(r), value: Number(r.utility_total) })),
    "month",
  );
  const labourChartData = toAnalyticsChartData(
    monthly.map((r) => ({ periodStart: monthLabel(r), value: Number(r.labour_total) })),
    "month",
  );
  const operatingProfitChartData = toAnalyticsChartData(
    monthly.map((r) => ({ periodStart: monthLabel(r), value: Number(r.operating_profit) })),
    "month",
  );
  const grossProfitChartData = toAnalyticsChartData(
    monthly.map((r) => ({ periodStart: monthLabel(r), value: Number(r.gross_profit) })),
    "month",
  );

  const yoyChange = kpis ? Number(kpis.yoy_change) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <Link
          href={routes.analytics.home}
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Analytics
        </Link>

        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Important note */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
        <span className="mt-0.5 text-text-muted">ⓘ</span>
        <span>
          <strong className="text-text-primary">Gross profit</strong> (shown in Revenue analytics)
          reflects order COGS only. <strong className="text-text-primary">Operating profit</strong>{" "}
          here deducts utility and labour monthly bills — this is your true business profit after overhead.
        </span>
      </div>

      {/* KPI cards */}
      {isLoading && !kpis ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-surface" />
          ))}
        </div>
      ) : kpis ? (
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AnalyticsKpiCard
            variant="operations"
            label="Total overhead"
            value={formatCurrency(kpis.total_overhead)}
            dateRangeLabel={`${year} full year`}
            trendPercentage={
              Number(kpis.prior_year_overhead) > 0
                ? Math.abs(
                    Math.round(
                      ((Number(kpis.total_overhead) - Number(kpis.prior_year_overhead)) /
                        Number(kpis.prior_year_overhead)) *
                        100,
                    ),
                  )
                : null
            }
            trendDirection={
              Number(kpis.prior_year_overhead) > 0
                ? yoyChange > 0
                  ? "up"
                  : yoyChange < 0
                    ? "down"
                    : "flat"
                : null
            }
            trendComparisonLabel={`vs ${kpis.prior_year}`}
          />
          <AnalyticsKpiCard
            variant="revenue"
            label="Utility costs"
            value={formatCurrency(kpis.total_utility)}
            dateRangeLabel={`${kpis.utility_entry_count} entries recorded`}
          />
          <AnalyticsKpiCard
            variant="profit"
            label="Labour costs"
            value={formatCurrency(kpis.total_labour)}
            dateRangeLabel={`${kpis.labour_entry_count} entries recorded`}
          />
          <AnalyticsKpiCard
            variant="margin"
            label="Monthly average"
            value={formatCurrency(kpis.monthly_average)}
            dateRangeLabel={`Based on ${kpis.months_recorded} months with entries`}
          />
        </dl>
      ) : null}

      {/* Year-over-year comparison */}
      {kpis && Number(kpis.prior_year_overhead) > 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm">
          <span className="text-text-secondary">
            Prior year ({kpis.prior_year}) overhead: {formatCurrency(kpis.prior_year_overhead)}
          </span>
          <span
            className={cn(
              "ml-auto flex items-center gap-1 font-medium",
              yoyChange > 0 ? "text-danger" : yoyChange < 0 ? "text-success" : "text-text-muted",
            )}
          >
            {yoyChange > 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : yoyChange < 0 ? (
              <TrendingDown className="h-4 w-4" />
            ) : null}
            {yoyChange > 0 ? "+" : ""}
            {formatCurrency(kpis.yoy_change)} vs {kpis.prior_year}
          </span>
        </div>
      ) : null}

      {/* Monthly overhead bar charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsChartCard
          category="revenue"
          title="Utility costs by month"
          description="Monthly electricity, water, internet, and other utility bills."
        >
          <AnalyticsBarChart
            category="revenue"
            data={utilityChartData}
            formatValue={formatCurrency}
            valueLabel="Utility"
            isLoading={monthlyQuery.isLoading}
            isError={monthlyQuery.isError}
            emptyTitle="No utility bills recorded"
            emptyDescription="Add monthly bills to your utility charges to see spending trends here."
          />
        </AnalyticsChartCard>

        <AnalyticsChartCard
          category="profit"
          title="Labour costs by month"
          description="Monthly staff, preparation, packaging, and other labour bills."
        >
          <AnalyticsBarChart
            category="profit"
            data={labourChartData}
            formatValue={formatCurrency}
            valueLabel="Labour"
            isLoading={monthlyQuery.isLoading}
            isError={monthlyQuery.isError}
            emptyTitle="No labour bills recorded"
            emptyDescription="Add monthly bills to your labour charges to see spending trends here."
          />
        </AnalyticsChartCard>
      </div>

      {/* Operating profit vs gross profit */}
      <AnalyticsChartCard
        category="margin"
        title="Operating profit vs gross profit by month"
        description="Gross profit = order revenue minus product/delivery COGS. Operating profit deducts monthly overhead bills."
      >
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--analytics-profit)]" />
              Gross profit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--analytics-margin)]" />
              Operating profit (after overhead)
            </span>
          </div>
          <AnalyticsLineChart
            category="profit"
            data={grossProfitChartData}
            formatValue={formatCurrency}
            valueLabel="Gross profit"
            isLoading={monthlyQuery.isLoading}
            isError={monthlyQuery.isError}
            emptyTitle="No order data for this year"
            emptyDescription="Profit trends appear once orders exist in the selected year."
          />
        </div>
      </AnalyticsChartCard>

      {/* Monthly detail table */}
      <SectionCard
        title="Month-by-month breakdown"
        description={`Utility, labour, gross profit, and operating profit for ${year}.`}
      >
        {monthlyQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-surface-hover" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="pb-2 font-medium">Month</th>
                  <th className="pb-2 font-medium">Utility</th>
                  <th className="pb-2 font-medium">Labour</th>
                  <th className="pb-2 font-medium">Total overhead</th>
                  <th className="pb-2 font-medium">Gross profit</th>
                  <th className="pb-2 font-medium text-right">Operating profit</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((row) => {
                  const opProfit = Number(row.operating_profit);
                  return (
                    <tr
                      key={row.month}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="py-2.5 font-medium text-text-primary">
                        {MONTH_NAMES[row.month - 1]}
                      </td>
                      <td className="py-2.5 tabular-nums text-text-secondary">
                        {formatCurrency(row.utility_total)}
                      </td>
                      <td className="py-2.5 tabular-nums text-text-secondary">
                        {formatCurrency(row.labour_total)}
                      </td>
                      <td className="py-2.5 tabular-nums text-text-secondary">
                        {formatCurrency(row.overhead_total)}
                      </td>
                      <td className="py-2.5 tabular-nums text-text-secondary">
                        {formatCurrency(row.gross_profit)}
                      </td>
                      <td
                        className={cn(
                          "py-2.5 text-right font-medium tabular-nums",
                          opProfit > 0
                            ? "text-success"
                            : opProfit < 0
                              ? "text-danger"
                              : "text-text-muted",
                        )}
                      >
                        {formatCurrency(row.operating_profit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Category breakdown */}
      <SectionCard
        title="Spend by overhead category"
        description={`Which utility and labour categories cost the most in ${year}.`}
      >
        {categoryQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-surface-hover" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="py-6 text-center text-sm text-text-secondary">
            No overhead categories recorded for {year}.
          </p>
        ) : (
          <DataTable
            columns={categoryColumns}
            data={categories}
            emptyMessage={`No overhead spend recorded for ${year}.`}
          />
        )}
      </SectionCard>
    </div>
  );
}

function monthLabel(row: OverheadMonthlyRow): string {
  return `${row.year}-${String(row.month).padStart(2, "0")}-01`;
}
