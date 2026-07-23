"use client";

import type { OrderFinancialPerformance as OrderFinancialPerformanceType } from "@/lib/api/orders";
import { OrderRevenueBreakdown } from "@/components/orders/OrderRevenueBreakdown";
import { formatCurrency } from "@/lib/format";
import type { OrderFinancialBreakdownType } from "@/lib/orders/financial-display";
import { cn } from "@/lib/utils";

type OrderFinancialPerformanceProps = {
  performance: OrderFinancialPerformanceType;
  orderType?: OrderFinancialBreakdownType;
  className?: string;
};

export function OrderFinancialPerformance({
  performance,
  orderType,
  className,
}: OrderFinancialPerformanceProps) {
  const { snapshot, is_historical_snapshot } = performance;
  const profitPositive = Number(snapshot.total_profit_snapshot) >= 0;

  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-surface p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Financial performance
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            Whole order — customer total includes delivery. Packaging fees are already
            embedded in collections revenue (shown separately below as a breakdown only).
            Profit subtracts production cost, packaging materials, and estimated delivery
            cost. Margin is profit as a percentage of total order revenue. Values are frozen
            when the order is saved.
          </p>
        </div>
        {is_historical_snapshot ? (
          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-text-secondary">
            Historical snapshot
          </span>
        ) : null}
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-text-secondary">Revenue</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-text-primary">
            {formatCurrency(snapshot.total_revenue_snapshot)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-text-secondary">Cost</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-text-primary">
            {formatCurrency(snapshot.total_cost_snapshot)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-text-secondary">Profit</dt>
          <dd
            className={cn(
              "mt-1 text-lg font-semibold tabular-nums",
              profitPositive ? "text-success" : "text-danger",
            )}
          >
            {formatCurrency(snapshot.total_profit_snapshot)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-text-secondary">Margin</dt>
          <dd
            className={cn(
              "mt-1 text-lg font-semibold tabular-nums",
              profitPositive ? "text-success" : "text-danger",
            )}
          >
            {snapshot.margin_percentage_snapshot}%
          </dd>
        </div>
      </dl>

      <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
        <OrderRevenueBreakdown snapshot={snapshot} orderType={orderType} />
      </dl>
    </section>
  );
}
