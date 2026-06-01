"use client";

import type {
  OrderCollectionLine,
  OrderFinancialSnapshot,
  OrderProductLine,
} from "@/lib/api/orders";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type OrderFinancialSummaryProps = {
  /** Live preview snapshot (create form) — optional when only showing lines on detail */
  snapshot?: OrderFinancialSnapshot;
  productLines?: OrderProductLine[];
  collectionLines?: OrderCollectionLine[];
  className?: string;
};

export function OrderFinancialSummary({
  snapshot,
  productLines,
  collectionLines,
  className,
}: OrderFinancialSummaryProps) {
  const profitPositive = snapshot
    ? Number(snapshot.total_profit_snapshot) >= 0
    : true;

  return (
    <div className={cn("space-y-6", className)}>
      {productLines && productLines.length > 0 ? (
        <section className="rounded-lg border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Product snapshots
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Qty</th>
                  <th className="pb-2 font-medium">Unit price</th>
                  <th className="pb-2 font-medium">Unit profit</th>
                  <th className="pb-2 text-right font-medium">Line revenue</th>
                </tr>
              </thead>
              <tbody>
                {productLines.map((line) => (
                  <tr key={line.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 text-text-primary">{line.product_name_snapshot}</td>
                    <td className="py-2.5 text-text-secondary">{line.quantity}</td>
                    <td className="py-2.5 text-text-secondary">
                      {formatCurrency(line.product_selling_price_snapshot)}
                    </td>
                    <td className="py-2.5 text-text-secondary">
                      {formatCurrency(line.product_profit_snapshot)}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      {formatCurrency(line.line_revenue_snapshot)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {collectionLines && collectionLines.length > 0 ? (
        <section className="rounded-lg border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Collection snapshots
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="pb-2 font-medium">Collection</th>
                  <th className="pb-2 font-medium">Qty</th>
                  <th className="pb-2 font-medium">Unit price</th>
                  <th className="pb-2 font-medium">Unit profit</th>
                  <th className="pb-2 text-right font-medium">Line revenue</th>
                </tr>
              </thead>
              <tbody>
                {collectionLines.map((line) => (
                  <tr key={line.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 text-text-primary">{line.collection_name_snapshot}</td>
                    <td className="py-2.5 text-text-secondary">{line.quantity}</td>
                    <td className="py-2.5 text-text-secondary">
                      {formatCurrency(line.collection_selling_price_snapshot)}
                    </td>
                    <td className="py-2.5 text-text-secondary">
                      {formatCurrency(line.collection_profit_snapshot)}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">
                      {formatCurrency(line.line_revenue_snapshot)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {snapshot ? (
        <section className="rounded-lg border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Preview totals
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            Live estimate before saving — final amounts are frozen when the order is created.
          </p>
          <dl className="mt-4 space-y-2 text-sm">
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
            <div className="flex justify-between gap-4 border-t border-border pt-2 font-medium">
              <dt className="text-text-primary">Revenue</dt>
              <dd className="tabular-nums text-text-primary">
                {formatCurrency(snapshot.total_revenue_snapshot)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">Cost</dt>
              <dd className="tabular-nums text-text-primary">
                {formatCurrency(snapshot.total_cost_snapshot)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">Profit</dt>
              <dd
                className={cn(
                  "tabular-nums font-medium",
                  profitPositive ? "text-success" : "text-danger",
                )}
              >
                {formatCurrency(snapshot.total_profit_snapshot)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">Margin</dt>
              <dd
                className={cn(
                  "tabular-nums font-medium",
                  profitPositive ? "text-success" : "text-danger",
                )}
              >
                {snapshot.margin_percentage_snapshot}%
              </dd>
            </div>
          </dl>
        </section>
      ) : null}
    </div>
  );
}
