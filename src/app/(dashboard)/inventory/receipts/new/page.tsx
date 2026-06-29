"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PurchaseReceiptAttachments } from "@/components/inventory/PurchaseReceiptAttachments";
import { PurchaseReceiptForm } from "@/components/inventory/PurchaseReceiptForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import { productItemsApi } from "@/lib/api/product-items";
import { purchaseReceiptsApi } from "@/lib/api/purchase-receipts";
import { suppliersApi } from "@/lib/api/suppliers";
import { uploadPurchaseReceiptAttachments } from "@/lib/purchase-receipt-attachments";
import type { PurchaseReceiptFormValues } from "@/lib/validation/inventory";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

function toPayload(values: PurchaseReceiptFormValues) {
  return {
    supplier_id: values.supplier_id,
    receipt_date: values.receipt_date,
    reference_number: values.reference_number || null,
    notes: values.notes || null,
    lines: values.lines.map((line) => ({
      product_item_id: line.product_item_id,
      quantity: line.quantity,
      unit: line.unit,
      line_total: line.line_total,
      expires_at: line.expires_at || null,
    })),
  };
}

export default function NewPurchaseReceiptPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers", "active"],
    queryFn: () => suppliersApi.listActive(),
  });

  const {
    data: itemsData,
    isLoading: itemsLoading,
    isError: itemsError,
  } = useQuery({
    queryKey: ["product-items", "receipt-form"],
    queryFn: () =>
      productItemsApi.list({ page: 1, page_size: 100, sort_by: "name", sort_order: "asc" }),
  });

  const handleSubmit = async (values: PurchaseReceiptFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await purchaseReceiptsApi.create(toPayload(values));
      if (pendingFiles.length > 0) {
        await uploadPurchaseReceiptAttachments(created.id, pendingFiles);
      }
      await queryClient.invalidateQueries({ queryKey: ["purchase-receipts"] });
      notifyActionSuccess("Purchase receipt created successfully.");
      router.push(routes.inventory.receipts.detail(created.id));
    } catch (err) {
      notifyActionError(err, "Unable to create purchase receipt.", setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPageShell
      title="Create Purchase Receipt"
      description="Record a supplier purchase as a draft before confirming stock."
    >
      <PageActions backHref={routes.inventory.receipts.list} className="mb-6" />
      {suppliersLoading || itemsLoading ? (
        <div className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      ) : itemsError ? (
        <p className="text-sm text-danger">
          Unable to load product items. Refresh the page and try again.
        </p>
      ) : (
        <PurchaseReceiptForm
          suppliers={suppliers}
          productItems={itemsData?.items ?? []}
          submitLabel="Save draft"
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
          attachmentsSlot={
            <PurchaseReceiptAttachments
              pendingFiles={pendingFiles}
              onPendingFilesChange={setPendingFiles}
            />
          }
        />
      )}
    </DashboardPageShell>
  );
}
