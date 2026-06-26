"use client";

import Link from "next/link";

import { routes } from "@/config/routes";
import type { OrderDetail } from "@/lib/api/orders";
import { formatDateTime } from "@/lib/format";

type OrderInventoryConsumptionBannerProps = {
  order: OrderDetail;
};

export function OrderInventoryConsumptionBanner({ order }: OrderInventoryConsumptionBannerProps) {
  const consumption = order.inventory_consumption;
  if (!consumption) {
    return null;
  }

  if (consumption.pending_proposal_id) {
    return (
      <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3">
        <p className="text-sm font-medium text-warning">Stock review pending</p>
        <p className="mt-1 text-sm text-text-secondary">
          Ingredient and packaging deductions for this order are awaiting approval.
        </p>
        <Link
          href={routes.inventory.consumption.detail(consumption.pending_proposal_id)}
          className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
        >
          Review stock consumption
        </Link>
      </div>
    );
  }

  if (consumption.applied_proposal_id && consumption.consumed_at) {
    return (
      <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3">
        <p className="text-sm font-medium text-success">Stock deducted</p>
        <p className="mt-1 text-sm text-text-secondary">
          Inventory was updated on {formatDateTime(consumption.consumed_at)}.
        </p>
        <Link
          href={routes.inventory.consumption.detail(consumption.applied_proposal_id)}
          className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
        >
          View applied review
        </Link>
      </div>
    );
  }

  return null;
}
