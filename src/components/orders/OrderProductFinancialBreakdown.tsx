"use client";

import type { OrderProductLine } from "@/lib/api/orders";
import { formatCurrency, formatPercent } from "@/lib/format";
import { formatQuantityDisplay, marginToneClass, parseAmount } from "@/lib/orders/financial-display";
import { cn } from "@/lib/utils";

type OrderProductFinancialBreakdownProps = {
  productLines: OrderProductLine[];
};

const tableHeadClass = "border-b border-border text-text-secondary";
const tableThClass = "pb-2 pr-3 font-medium whitespace-nowrap";
const tableRowClass = "border-b border-border/60 last:border-0";
const tableTdClass = "py-2.5 pr-3";

export function OrderProductFinancialBreakdown({
  productLines,
}: OrderProductFinancialBreakdownProps) {
  if (productLines.length === 0) {
    return null;
  }

  const totals = productLines.reduce(
    (acc, line) => {
      acc.revenue += parseAmount(line.line_revenue_snapshot) ?? 0;
      acc.cost += parseAmount(line.line_cost_snapshot) ?? 0;
      acc.profit += parseAmount(line.line_profit_snapshot) ?? 0;
      return acc;
    },
    { revenue: 0, cost: 0, profit: 0 },
  );
  const totalMargin = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0;

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
        Product cookie financial breakdown
      </h3>
      <p className="mt-1 text-xs text-text-muted">
        Per-product snapshots for product-only or mixed orders.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr className={tableHeadClass}>
              <th className={tableThClass}>Cookie</th>
              <th className={tableThClass}>Qty</th>
              <th className={tableThClass}>Unit selling</th>
              <th className={tableThClass}>Unit cost</th>
              <th className={cn(tableThClass, "text-right")}>Revenue</th>
              <th className={cn(tableThClass, "text-right")}>Cost</th>
              <th className={cn(tableThClass, "text-right")}>Profit</th>
              <th className={cn(tableThClass, "text-right")}>Margin</th>
            </tr>
          </thead>
          <tbody>
            {productLines.map((line) => {
              const margin = parseAmount(line.margin_percentage_snapshot) ?? 0;
              return (
                <tr key={line.id} className={tableRowClass}>
                  <td className={cn(tableTdClass, "text-text-primary")}>
                    {line.product_name_snapshot}
                  </td>
                  <td className={cn(tableTdClass, "text-text-secondary")}>
                    {formatQuantityDisplay(line.quantity)}
                  </td>
                  <td className={cn(tableTdClass, "tabular-nums text-text-secondary")}>
                    {formatCurrency(line.product_selling_price_snapshot)}
                  </td>
                  <td className={cn(tableTdClass, "tabular-nums text-text-secondary")}>
                    {formatCurrency(line.product_cost_snapshot)}
                  </td>
                  <td className={cn(tableTdClass, "text-right tabular-nums")}>
                    {formatCurrency(line.line_revenue_snapshot)}
                  </td>
                  <td className={cn(tableTdClass, "text-right tabular-nums text-text-secondary")}>
                    {formatCurrency(line.line_cost_snapshot)}
                  </td>
                  <td className={cn(tableTdClass, "text-right tabular-nums font-medium text-text-primary")}>
                    {formatCurrency(line.line_profit_snapshot)}
                  </td>
                  <td
                    className={cn(
                      tableTdClass,
                      "text-right tabular-nums font-medium",
                      marginToneClass(margin),
                    )}
                  >
                    {formatPercent(line.margin_percentage_snapshot)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dl className="mt-5 grid gap-2 border-t border-border pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex justify-between gap-3 sm:block">
          <dt className="text-text-secondary">Product totals revenue</dt>
          <dd className="tabular-nums font-medium text-text-primary">{formatCurrency(totals.revenue)}</dd>
        </div>
        <div className="flex justify-between gap-3 sm:block">
          <dt className="text-text-secondary">Product totals cost</dt>
          <dd className="tabular-nums text-text-primary">{formatCurrency(totals.cost)}</dd>
        </div>
        <div className="flex justify-between gap-3 sm:block">
          <dt className="text-text-secondary">Product totals profit</dt>
          <dd className="tabular-nums font-medium text-text-primary">{formatCurrency(totals.profit)}</dd>
        </div>
        <div className="flex justify-between gap-3 sm:block">
          <dt className="text-text-secondary">Product totals margin</dt>
          <dd className={cn("tabular-nums font-medium", marginToneClass(totalMargin))}>
            {formatPercent(totalMargin)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
