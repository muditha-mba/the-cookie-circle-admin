"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { DetailField } from "@/components/data/DetailField";
import { DetailMetadataCard } from "@/components/data/DetailMetadataCard";
import { PageActions, PrimaryLink, SecondaryButton } from "@/components/data/PageActions";
import { PurchaseReceiptAttachments } from "@/components/inventory/PurchaseReceiptAttachments";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { purchaseReceiptsApi } from "@/lib/api/purchase-receipts";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { getErrorMessage } from "@/lib/api/error-message";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

export default function PurchaseReceiptDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirmDelete, deleteDialog } = useConfirmDelete();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["purchase-receipts", params.id],
    queryFn: () => purchaseReceiptsApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const confirmMutation = useMutation({
    meta: { successMessage: "Receipt confirmed and stock updated." },
    mutationFn: () => purchaseReceiptsApi.confirm(params.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchase-receipts"] });
      await queryClient.invalidateQueries({ queryKey: ["inventory-balances"] });
      await queryClient.invalidateQueries({ queryKey: ["inventory-lots"] });
      await queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
    },
  });

  const handleDelete = () => {
    if (!data || data.status !== "draft") {
      return;
    }
    confirmDelete({
      message: "Delete this draft purchase receipt?",
      onConfirm: async () => {
        setActionError(null);
        try {
          await purchaseReceiptsApi.delete(data.id);
          await queryClient.invalidateQueries({ queryKey: ["purchase-receipts"] });
          notifyActionSuccess("Purchase receipt deleted successfully.");
          router.push(routes.inventory.receipts.list);
        } catch (err) {
          notifyActionError(err, "Unable to delete purchase receipt.", setActionError);
        }
      },
    });
  };

  const handleConfirm = () => {
    if (!data || data.status !== "draft") {
      return;
    }

    const lineSummary = data.lines
      .map(
        (line) =>
          `• ${line.product_item_name}: ${Number(line.quantity).toLocaleString()} ${line.unit} — ${formatCurrency(line.line_total)}`,
      )
      .join("\n");

    confirmDelete({
      title: "Confirm & receive stock?",
      message: `This will add stock to inventory. Check quantities and amounts paid before continuing — line items cannot be changed after this.\n\n${lineSummary}\n\nTotal: ${formatCurrency(data.total_amount)}`,
      confirmLabel: "Confirm & receive stock",
      confirmingLabel: "Confirming...",
      confirmVariant: "default",
      onConfirm: async () => {
        setActionError(null);
        try {
          await confirmMutation.mutateAsync();
        } catch (err) {
          setActionError(getErrorMessage(err, "Unable to confirm receipt."));
        }
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Purchase Receipt" description="Loading...">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Purchase Receipt" description="Not found">
        <p className="text-sm text-danger">Purchase receipt not found.</p>
        <PageActions backHref={routes.inventory.receipts.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  const isDraft = data.status === "draft";

  return (
    <DashboardPageShell
      title={data.reference_number ? `Receipt ${data.reference_number}` : "Purchase Receipt"}
      description={`${data.supplier.supplier_name} · ${formatDate(data.receipt_date)}`}
    >
      {deleteDialog}
      <PageActions backHref={routes.inventory.receipts.list} className="mb-6">
        {isDraft ? <PrimaryLink href={routes.inventory.receipts.edit(data.id)}>Edit</PrimaryLink> : null}
        {isDraft ? (
          <SecondaryButton onClick={handleConfirm} disabled={confirmMutation.isPending}>
            {confirmMutation.isPending ? "Confirming..." : "Confirm & receive stock"}
          </SecondaryButton>
        ) : null}
        {isDraft ? (
          <SecondaryButton variant="danger" onClick={handleDelete}>
            Delete
          </SecondaryButton>
        ) : null}
      </PageActions>

      {actionError ? <p className="mb-4 text-sm text-danger">{actionError}</p> : null}

      {!isDraft ? (
        <p className="mb-4 text-sm text-text-secondary">
          Stock has been received for this receipt. Line items cannot be changed, but you can still
          attach supplier invoice photos below.
        </p>
      ) : null}

      <DetailMetadataCard>
        <DetailField label="Status" value={data.status === "confirmed" ? "Confirmed" : "Draft"} />
        <DetailField label="Supplier" value={data.supplier.supplier_name} />
        <DetailField label="Total" value={formatCurrency(data.total_amount)} />
        <DetailField
          label="Confirmed"
          value={data.confirmed_at ? formatDateTime(data.confirmed_at) : "—"}
        />
        <DetailField label="Notes" value={data.notes || "—"} fullWidth />
      </DetailMetadataCard>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-medium text-text-primary">Line items</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-surface-hover">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Item</th>
                <th className="px-4 py-3 text-left font-medium">Qty</th>
                <th className="px-4 py-3 text-left font-medium">Amount paid</th>
                <th className="px-4 py-3 text-left font-medium">Per unit</th>
                <th className="px-4 py-3 text-left font-medium">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {data.lines.map((line) => (
                <tr key={line.id}>
                  <td className="px-4 py-3">{line.product_item_name}</td>
                  <td className="px-4 py-3">
                    {Number(line.quantity).toLocaleString()} {line.unit}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(line.line_total)}</td>
                  <td className="px-4 py-3">{formatCurrency(line.unit_cost)}</td>
                  <td className="px-4 py-3">
                    {line.expires_at ? formatDate(line.expires_at) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-8">
        <PurchaseReceiptAttachments
          receiptId={data.id}
          attachments={data.attachments}
          isDraft={isDraft}
        />
      </div>
    </DashboardPageShell>
  );
}
