"use client";

import { useQuery } from "@tanstack/react-query";

import { businessSettingsApi } from "@/lib/api/business-settings";
import type { OrderDetail } from "@/lib/api/orders";
import { formatCurrency } from "@/lib/format";

type OrderBankTransferInstructionsProps = {
  order: OrderDetail;
};

export function OrderBankTransferInstructions({ order }: OrderBankTransferInstructionsProps) {
  const settingsQuery = useQuery({
    queryKey: ["business-settings"],
    queryFn: () => businessSettingsApi.get(),
  });

  if (order.payment_method !== "bank_transfer") {
    return null;
  }

  const details = settingsQuery.data?.bank_transfer_details;
  if (!details) {
    return null;
  }

  const copyText = [
    `Amount: ${formatCurrency(order.total_revenue_snapshot)}`,
    `Reference: ${order.order_number}`,
    `Bank: ${details.bank_name}`,
    `Account name: ${details.account_name}`,
    `Account number: ${details.account_number}`,
    details.branch ? `Branch: ${details.branch}` : null,
    details.instructions,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-4">
      <p className="text-sm font-semibold text-text-primary">Bank transfer instructions</p>
      <p className="mt-1 text-xs text-text-muted">
        Share these details with the customer or use them to verify incoming transfers.
      </p>
      <dl className="mt-3 space-y-1 text-sm text-text-secondary">
        <div className="flex justify-between gap-4">
          <dt>Amount</dt>
          <dd>{formatCurrency(order.total_revenue_snapshot)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Reference</dt>
          <dd>{order.order_number}</dd>
        </div>
        {details.bank_name ? (
          <div className="flex justify-between gap-4">
            <dt>Bank</dt>
            <dd>{details.bank_name}</dd>
          </div>
        ) : null}
        {details.account_number ? (
          <div className="flex justify-between gap-4">
            <dt>Account number</dt>
            <dd>{details.account_number}</dd>
          </div>
        ) : null}
      </dl>
      <button
        type="button"
        className="mt-3 text-sm font-medium text-primary hover:underline"
        onClick={async () => {
          await navigator.clipboard.writeText(copyText);
        }}
      >
        Copy payment instructions
      </button>
    </div>
  );
}
