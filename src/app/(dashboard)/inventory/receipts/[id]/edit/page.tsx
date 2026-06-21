"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { PurchaseReceiptAttachments } from "@/components/inventory/PurchaseReceiptAttachments";
import { PurchaseReceiptForm } from "@/components/inventory/PurchaseReceiptForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import { productItemsApi } from "@/lib/api/product-items";
import { purchaseReceiptsApi } from "@/lib/api/purchase-receipts";
import { suppliersApi } from "@/lib/api/suppliers";
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

export default function EditPurchaseReceiptPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["purchase-receipts", params.id],
    queryFn: () => purchaseReceiptsApi.get(params.id),
    enabled: Boolean(params.id),
  });

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
      await purchaseReceiptsApi.update(params.id, toPayload(values));
      await queryClient.invalidateQueries({ queryKey: ["purchase-receipts"] });
      notifyActionSuccess("Changes saved successfully.");
      router.push(routes.inventory.receipts.detail(params.id));
    } catch (err) {
      notifyActionError(err, "Unable to update purchase receipt.", setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || suppliersLoading || itemsLoading) {
    return (
      <DashboardPageShell title="Edit Purchase Receipt" description="Loading...">
        <div className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (itemsError) {
    return (
      <DashboardPageShell title="Edit Purchase Receipt" description="Unable to load product items">
        <p className="text-sm text-danger">
          Unable to load product items. Refresh the page and try again.
        </p>
        <PageActions backHref={routes.inventory.receipts.detail(params.id)} className="mt-6" />
      </DashboardPageShell>
    );
  }

  if (isError || !data || data.status !== "draft") {
    return (
      <DashboardPageShell title="Edit Purchase Receipt" description="Not available">
        <p className="text-sm text-danger">Only draft receipts can be edited.</p>
        <PageActions backHref={routes.inventory.receipts.detail(params.id)} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell title="Edit Purchase Receipt" description="Update draft receipt lines.">
      <PageActions backHref={routes.inventory.receipts.detail(params.id)} className="mb-6" />
      <PurchaseReceiptForm
        suppliers={suppliers}
        productItems={itemsData?.items ?? []}
        defaultValues={{
          supplier_id: data.supplier.id,
          receipt_date: data.receipt_date,
          reference_number: data.reference_number ?? "",
          notes: data.notes ?? "",
          lines: data.lines.map((line) => ({
            product_item_id: line.product_item_id,
            quantity: Number(line.quantity),
            unit: line.unit,
            line_total: Number(line.line_total),
            expires_at: line.expires_at ?? "",
          })),
        }}
        submitLabel="Save changes"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
        attachmentsSlot={
          <PurchaseReceiptAttachments
            receiptId={params.id}
            attachments={data.attachments}
            isDraft
          />
        }
      />
    </DashboardPageShell>
  );
}
