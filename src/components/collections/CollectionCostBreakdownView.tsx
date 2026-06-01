"use client";

import type { CollectionCostBreakdown } from "@/lib/api/collections";
import type { ChargeBreakdownLine } from "@/lib/api/products";
import { formatChargeAmount, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type CollectionCostBreakdownViewProps = {
  breakdown: CollectionCostBreakdown;
  className?: string;
};

function SectionCard({
  title,
  children,
  subtotal,
  className,
}: {
  title: string;
  children: React.ReactNode;
  subtotal?: string | number;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-lg border border-border bg-surface p-5", className)}
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
        {title}
      </h3>
      {children}
      {subtotal !== undefined ? (
        <p className="mt-4 text-right text-sm text-text-secondary">
          Subtotal: <Money value={subtotal} />
        </p>
      ) : null}
    </section>
  );
}

function Money({ value }: { value: string | number }) {
  return <span className="font-medium tabular-nums">{formatCurrency(value)}</span>;
}

const tableHeadClass = "border-b border-border text-text-secondary";
const tableThClass = "pb-2 font-medium";
const tableRowClass = "border-b border-border/60 last:border-0";
const tableTdClass = "py-2.5";

type ChargeRow = ChargeBreakdownLine & {
  category: "Utility" | "Labour" | "Tax & fees";
};

function buildChargeRows(breakdown: CollectionCostBreakdown): ChargeRow[] {
  return [
    ...breakdown.additional_charges.utility_charges.map((line) => ({
      ...line,
      category: "Utility" as const,
    })),
    ...breakdown.additional_charges.labour_charges.map((line) => ({
      ...line,
      category: "Labour" as const,
    })),
    ...breakdown.additional_charges.tax_charges.map((line) => ({
      ...line,
      category: "Tax & fees" as const,
    })),
  ];
}

export function CollectionCostBreakdownView({
  breakdown,
  className,
}: CollectionCostBreakdownViewProps) {
  const profitPositive = Number(breakdown.profit_amount) >= 0;
  const profitClass = profitPositive ? "text-success" : "text-danger";
  const chargeRows = buildChargeRows(breakdown);

  return (
    <div className={cn("space-y-6", className)}>
      <SectionCard title="Products" subtotal={breakdown.products.subtotal}>
        {breakdown.products.lines.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">No products in this collection.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className={tableHeadClass}>
                  <th className={tableThClass}>Product</th>
                  <th className={tableThClass}>Quantity</th>
                  <th className={tableThClass}>Unit total cost</th>
                  <th className={cn(tableThClass, "text-right")}>Cost contribution</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.products.lines.map((line) => (
                  <tr key={line.id} className={tableRowClass}>
                    <td className={cn(tableTdClass, "text-text-primary")}>{line.product_name}</td>
                    <td className={cn(tableTdClass, "text-text-secondary")}>{line.quantity}</td>
                    <td className={cn(tableTdClass, "text-text-secondary")}>
                      <Money value={line.unit_total_cost} />
                    </td>
                    <td className={cn(tableTdClass, "text-right")}>
                      <Money value={line.cost_contribution} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Packaging & collection items"
        subtotal={breakdown.collection_items.subtotal}
      >
        {breakdown.collection_items.lines.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">
            No packaging or collection items in this collection.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className={tableHeadClass}>
                  <th className={tableThClass}>Item</th>
                  <th className={tableThClass}>Quantity</th>
                  <th className={tableThClass}>Cost per unit</th>
                  <th className={cn(tableThClass, "text-right")}>Applied cost</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.collection_items.lines.map((line) => (
                  <tr key={line.id} className={tableRowClass}>
                    <td className={cn(tableTdClass, "text-text-primary")}>
                      {line.product_item_name}
                      <span className="ml-1 text-text-muted">({line.unit})</span>
                    </td>
                    <td className={cn(tableTdClass, "text-text-secondary")}>{line.quantity}</td>
                    <td className={cn(tableTdClass, "text-text-secondary")}>
                      <Money value={line.cost_per_unit} />
                    </td>
                    <td className={cn(tableTdClass, "text-right")}>
                      <Money value={line.applied_cost} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Additional charges"
        subtotal={breakdown.additional_charges.subtotal}
      >
        {chargeRows.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">No additional charges attached.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className={tableHeadClass}>
                  <th className={tableThClass}>Category</th>
                  <th className={tableThClass}>Charge</th>
                  <th className={tableThClass}>Rate</th>
                  <th className={cn(tableThClass, "text-right")}>Applied cost</th>
                </tr>
              </thead>
              <tbody>
                {chargeRows.map((line) => (
                  <tr key={`${line.category}-${line.id}`} className={tableRowClass}>
                    <td className={cn(tableTdClass, "text-text-secondary")}>{line.category}</td>
                    <td className={cn(tableTdClass, "text-text-primary")}>{line.name}</td>
                    <td className={cn(tableTdClass, "text-text-secondary")}>
                      {formatChargeAmount(
                        line.configured_amount,
                        line.charge_type as "fixed" | "percentage",
                      )}
                    </td>
                    <td className={cn(tableTdClass, "text-right")}>
                      <Money value={line.applied_cost} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Summary">
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className={tableHeadClass}>
                <th className={tableThClass}>Metric</th>
                <th className={cn(tableThClass, "text-right")}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className={tableRowClass}>
                <td className={cn(tableTdClass, "text-text-secondary")}>Product costs</td>
                <td className={cn(tableTdClass, "text-right")}>
                  <Money value={breakdown.products.subtotal} />
                </td>
              </tr>
              <tr className={tableRowClass}>
                <td className={cn(tableTdClass, "text-text-secondary")}>
                  Packaging & collection items
                </td>
                <td className={cn(tableTdClass, "text-right")}>
                  <Money value={breakdown.collection_items.subtotal} />
                </td>
              </tr>
              <tr className={tableRowClass}>
                <td className={cn(tableTdClass, "text-text-secondary")}>Additional charges</td>
                <td className={cn(tableTdClass, "text-right")}>
                  <Money value={breakdown.additional_charges.subtotal} />
                </td>
              </tr>
              <tr className={tableRowClass}>
                <td className={cn(tableTdClass, "text-text-secondary")}>Buffer</td>
                <td className={cn(tableTdClass, "text-right")}>
                  <Money value={breakdown.buffer_amount} />
                </td>
              </tr>
              <tr className={cn(tableRowClass, "border-t border-border")}>
                <td className={cn(tableTdClass, "font-medium text-text-primary")}>Total cost</td>
                <td className={cn(tableTdClass, "text-right font-medium text-text-primary")}>
                  <Money value={breakdown.total_cost} />
                </td>
              </tr>
              <tr className={tableRowClass}>
                <td className={cn(tableTdClass, "text-text-secondary")}>Selling price</td>
                <td className={cn(tableTdClass, "text-right")}>
                  <Money value={breakdown.selling_price} />
                </td>
              </tr>
              <tr className={tableRowClass}>
                <td className={cn(tableTdClass, "text-text-secondary")}>Profit</td>
                <td className={cn(tableTdClass, "text-right font-medium", profitClass)}>
                  <Money value={breakdown.profit_amount} />
                </td>
              </tr>
              <tr className={tableRowClass}>
                <td className={cn(tableTdClass, "text-text-secondary")}>Profit margin</td>
                <td
                  className={cn(
                    tableTdClass,
                    "text-right font-medium tabular-nums",
                    profitClass,
                  )}
                >
                  {breakdown.profit_margin_percent}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
