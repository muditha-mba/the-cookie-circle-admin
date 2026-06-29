"use client";

import { useQueries } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AnalyticsKpiCard } from "@/components/analytics/AnalyticsKpiCard";
import {
  AnalyticsBarChart,
  AnalyticsChartCard,
  toAnalyticsChartData,
} from "@/components/analytics/charts";
import { DataTable } from "@/components/data/DataTable";
import { SectionCard } from "@/components/production/shared";
import { routes } from "@/config/routes";
import type { DiscountMonthlyRow, DiscountRulePerformanceRow } from "@/lib/api/analytics";
import { analyticsApi } from "@/lib/api/analytics";
import { formatCurrency } from "@/lib/format";

const ruleColumns: ColumnDef<DiscountRulePerformanceRow>[] = [
  {
    header: "Rule",
    accessorKey: "rule_name",
    cell: ({ row }) => (
      <span className="font-medium text-text-primary">{row.original.rule_name}</span>
    ),
  },
  {
    header: "Grants Issued",
    accessorKey: "grants_issued",
    cell: ({ row }) => row.original.grants_issued,
  },
  {
    header: "Grants Used",
    accessorKey: "grants_used",
    cell: ({ row }) => row.original.grants_used,
  },
  {
    header: "Redemption Rate",
    accessorKey: "redemption_rate_pct",
    cell: ({ row }) => `${row.original.redemption_rate_pct.toFixed(1)}%`,
  },
  {
    header: "Total Discount Given",
    accessorKey: "total_discount_given",
    cell: ({ row }) => (
      <span className="tabular-nums font-medium">
        {formatCurrency(row.original.total_discount_given)}
      </span>
    ),
  },
];

export function DiscountAnalyticsDashboard() {
  const [kpisQuery, monthlyQuery, rulesQuery] = useQueries({
    queries: [
      {
        queryKey: ["analytics", "discount-kpis"],
        queryFn: () => analyticsApi.getDiscountKpis(),
      },
      {
        queryKey: ["analytics", "discount-monthly"],
        queryFn: () => analyticsApi.getDiscountMonthlyTrends(),
      },
      {
        queryKey: ["analytics", "discount-rules"],
        queryFn: () => analyticsApi.getDiscountRulePerformance(),
      },
    ],
  });

  const kpis = kpisQuery.data;
  const monthly: DiscountMonthlyRow[] = monthlyQuery.data ?? [];
  const rules: DiscountRulePerformanceRow[] = rulesQuery.data ?? [];

  const monthlyChartData = toAnalyticsChartData(
    monthly.map((r) => ({
      periodStart: `${r.month}-01`,
      value: parseFloat(r.total_discount_amount),
    })),
    "month",
  );

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
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-text-primary">
          Discount Analytics
        </h1>
      </div>

      {/* KPIs */}
      {kpis ? (
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AnalyticsKpiCard
            variant="revenue"
            label="Grants issued"
            value={kpis.total_grants_issued}
          />
          <AnalyticsKpiCard
            variant="profit"
            label="Grants used"
            value={kpis.total_grants_used}
          />
          <AnalyticsKpiCard
            variant="margin"
            label="Redemption rate"
            value={`${kpis.redemption_rate_pct.toFixed(1)}%`}
          />
          <AnalyticsKpiCard
            variant="operations"
            label="Total discount given"
            value={formatCurrency(kpis.total_discount_amount)}
          />
        </dl>
      ) : kpisQuery.isLoading ? (
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-surface-hover" />
          ))}
        </dl>
      ) : null}

      {kpis ? (
        <dl className="grid gap-4 sm:grid-cols-3">
          <AnalyticsKpiCard
            variant="orders"
            label="Orders with discount"
            value={kpis.orders_with_discount}
          />
          <AnalyticsKpiCard
            variant="revenue"
            label="Avg discount per order"
            value={formatCurrency(kpis.avg_discount_per_order)}
          />
          <AnalyticsKpiCard
            variant="margin"
            label="Grants expired"
            value={kpis.total_grants_expired}
          />
        </dl>
      ) : null}

      {/* Monthly discount trend */}
      {monthlyChartData.length > 0 && (
        <AnalyticsChartCard
          category="revenue"
          title="Monthly discount given"
          description="Total discount amount applied to orders each month."
        >
          <AnalyticsBarChart
            category="revenue"
            data={monthlyChartData}
            formatValue={formatCurrency}
            valueLabel="Discount"
            isLoading={monthlyQuery.isLoading}
            isError={monthlyQuery.isError}
            emptyTitle="No discounts applied yet"
            emptyDescription="Discounts will appear here once orders with active grants are placed."
          />
        </AnalyticsChartCard>
      )}

      {/* Rule performance table */}
      <SectionCard title="Rule Performance">
        <DataTable
          columns={ruleColumns}
          data={rules}
          isLoading={rulesQuery.isLoading}
          emptyMessage="No discount rules found."
        />
      </SectionCard>
    </div>
  );
}
