"use client";

import type { OrderFinancialSnapshot } from "@/lib/api/orders";
import { formatCurrency } from "@/lib/format";
import {
  resolveFinancialBreakdownType,
  type OrderFinancialBreakdownType,
} from "@/lib/orders/financial-display";

type OrderRevenueBreakdownProps = {
  snapshot: OrderFinancialSnapshot;
  orderType?: OrderFinancialBreakdownType;
  showCosts?: boolean;
};

function BreakdownRow({
  label,
  amount,
}: {
  label: string;
  amount: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="tabular-nums text-text-primary">{formatCurrency(amount)}</dd>
    </div>
  );
}

export function OrderRevenueBreakdown({
  snapshot,
  orderType,
  showCosts = true,
}: OrderRevenueBreakdownProps) {
  const breakdownType = resolveFinancialBreakdownType(orderType, snapshot);
  const showProductsBlock = breakdownType === "catering";
  const showCollectionsBlock =
    breakdownType !== "catering" &&
    Number(snapshot.collections_subtotal_snapshot) > 0;

  return (
    <>
      {showProductsBlock ? (
        <>
          <BreakdownRow
            label="Products revenue"
            amount={snapshot.products_subtotal_snapshot}
          />
          {showCosts ? (
            <BreakdownRow
              label="Products cost"
              amount={snapshot.products_cost_snapshot}
            />
          ) : null}
          {Number(snapshot.package_fee_revenue_snapshot) > 0 ? (
            <BreakdownRow
              label="Packaging fee (included in products)"
              amount={snapshot.package_fee_revenue_snapshot}
            />
          ) : null}
        </>
      ) : null}

      {showCollectionsBlock ? (
        <>
          <BreakdownRow
            label="Collections revenue"
            amount={snapshot.collections_subtotal_snapshot}
          />
          {showCosts ? (
            <BreakdownRow
              label="Collections cost"
              amount={snapshot.collections_cost_snapshot}
            />
          ) : null}
          <BreakdownRow
            label="Packaging fee (included in collections)"
            amount={snapshot.package_fee_revenue_snapshot}
          />
          {showCosts ? (
            <BreakdownRow
              label="Packaging cost (materials)"
              amount={snapshot.packaging_cost_snapshot}
            />
          ) : null}
        </>
      ) : null}

      <BreakdownRow label="Delivery fee" amount={snapshot.delivery_fee_snapshot} />
      {showCosts && Number(snapshot.delivery_cost_snapshot) > 0 ? (
        <BreakdownRow
          label="Delivery cost (estimated)"
          amount={snapshot.delivery_cost_snapshot}
        />
      ) : null}
      {Number(snapshot.discount_amount_snapshot ?? "0") > 0 ? (
        <div className="flex justify-between gap-4">
          <dt className="text-text-secondary">
            Discount
            {snapshot.discount_type_snapshot === "percentage" && snapshot.discount_value_snapshot
              ? ` (${snapshot.discount_value_snapshot}%)`
              : ""}
          </dt>
          <dd className="tabular-nums text-green-600">
            − {formatCurrency(snapshot.discount_amount_snapshot!)}
          </dd>
        </div>
      ) : null}
      {snapshot.tax_lines_snapshot && snapshot.tax_lines_snapshot.length > 0 ? (
        snapshot.tax_lines_snapshot.map((tax) => (
          <BreakdownRow
            key={tax.tax_id}
            label={`${tax.name} (${tax.charge_type === "percentage" ? `${tax.configured_amount}%` : "flat"})`}
            amount={tax.applied_amount}
          />
        ))
      ) : null}
    </>
  );
}
