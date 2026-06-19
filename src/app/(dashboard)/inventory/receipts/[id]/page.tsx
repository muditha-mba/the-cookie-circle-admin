"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { DetailField } from "@/components/data/DetailField";
import { DetailMetadataCard } from "@/components/data/DetailMetadataCard";
import { PageActions, PrimaryLink, SecondaryButton } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { getAccessToken } from "@/lib/auth/token-storage";
import type { ApiError } from "@/lib/api/types";
import { purchaseReceiptsApi } from "@/lib/api/purchase-receipts";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";

export default function PurchaseReceiptDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirmDelete, deleteDialog } = useConfirmDelete();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["purchase-receipts", params.id],
    queryFn: () => purchaseReceiptsApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const confirmMutation = useMutation({
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
        await purchaseReceiptsApi.delete(data.id);
        await queryClient.invalidateQueries({ queryKey: ["purchase-receipts"] });
        router.push(routes.inventory.receipts.list);
      },
    });
  };

  const handleConfirm = async () => {
    setActionError(null);
    try {
      await confirmMutation.mutateAsync();
    } catch (err) {
      const apiError = err as ApiError;
      setActionError(apiError.message ?? "Unable to confirm receipt.");
    }
  };

  const handleBillUpload = async (file: File) => {
    if (!data || data.status !== "draft") {
      return;
    }
    setActionError(null);
    setIsUploading(true);
    try {
      const upload = await purchaseReceiptsApi.createBillUploadUrl(data.id, file.type);
      const response = await fetch(upload.upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!response.ok) {
        throw new Error("Bill upload failed.");
      }
      await purchaseReceiptsApi.update(data.id, {
        bill_asset_id: upload.asset_id,
        bill_content_type: file.type,
        bill_extension: upload.extension,
      });
      await queryClient.invalidateQueries({ queryKey: ["purchase-receipts", data.id] });
    } catch (err) {
      const apiError = err as ApiError;
      setActionError(apiError.message ?? "Unable to upload bill.");
    } finally {
      setIsUploading(false);
    }
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
                <th className="px-4 py-3 text-left font-medium">Unit cost</th>
                <th className="px-4 py-3 text-left font-medium">Line total</th>
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
                  <td className="px-4 py-3">{formatCurrency(line.unit_cost)}</td>
                  <td className="px-4 py-3">{formatCurrency(line.line_total)}</td>
                  <td className="px-4 py-3">
                    {line.expires_at ? formatDate(line.expires_at) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-medium text-text-primary">Supplier bill</h2>
        {data.has_bill ? (
          <a
            href={purchaseReceiptsApi.billUrl(data.id)}
            className="text-sm text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
            onClick={(event) => {
              event.preventDefault();
              const token = getAccessToken();
              if (!token) {
                return;
              }
              void fetch(purchaseReceiptsApi.billUrl(data.id), {
                headers: { Authorization: `Bearer ${token}` },
              })
                .then((response) => response.blob())
                .then((blob) => {
                  const url = URL.createObjectURL(blob);
                  window.open(url, "_blank");
                });
            }}
          >
            View bill
          </a>
        ) : isDraft ? (
          <div>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              disabled={isUploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleBillUpload(file);
                }
              }}
            />
            <p className="mt-2 text-sm text-text-secondary">
              Upload a PDF or image of the supplier invoice (max 10 MB).
            </p>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">No bill attached.</p>
        )}
      </section>
    </DashboardPageShell>
  );
}
