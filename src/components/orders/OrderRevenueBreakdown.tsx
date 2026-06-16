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
            label="Packaging fee"
            amount={snapshot.package_fee_revenue_snapshot}
          />
          {showCosts ? (
            <BreakdownRow
              label="Packaging cost"
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
    </>
  );
}
