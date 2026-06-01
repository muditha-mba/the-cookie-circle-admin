"use client";

import type { OrderFinancialPerformance as OrderFinancialPerformanceType } from "@/lib/api/orders";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type OrderFinancialPerformanceProps = {
  performance: OrderFinancialPerformanceType;
  className?: string;
};

export function OrderFinancialPerformance({
  performance,
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
            Values captured when this order was saved. They do not change if catalog costs or
            prices are updated later.
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
        <div className="flex justify-between gap-4">
          <dt className="text-text-secondary">Products revenue</dt>
          <dd className="tabular-nums text-text-primary">
            {formatCurrency(snapshot.products_subtotal_snapshot)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-secondary">Collections revenue</dt>
          <dd className="tabular-nums text-text-primary">
            {formatCurrency(snapshot.collections_subtotal_snapshot)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-text-secondary">Delivery fee</dt>
          <dd className="tabular-nums text-text-primary">
            {formatCurrency(snapshot.delivery_fee_snapshot)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
