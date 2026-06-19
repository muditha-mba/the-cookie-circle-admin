"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PurchaseReceiptForm } from "@/components/inventory/PurchaseReceiptForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { productItemsApi } from "@/lib/api/product-items";
import { purchaseReceiptsApi } from "@/lib/api/purchase-receipts";
import { suppliersApi } from "@/lib/api/suppliers";
import type { PurchaseReceiptFormValues } from "@/lib/validation/inventory";

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
      unit_cost: line.unit_cost,
      expires_at: line.expires_at || null,
    })),
  };
}

export default function NewPurchaseReceiptPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers", "active"],
    queryFn: () => suppliersApi.listActive(),
  });

  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ["product-items", "all"],
    queryFn: () =>
      productItemsApi.list({ page: 1, page_size: 200, sort_by: "name", sort_order: "asc" }),
  });

  const handleSubmit = async (values: PurchaseReceiptFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await purchaseReceiptsApi.create(toPayload(values));
      await queryClient.invalidateQueries({ queryKey: ["purchase-receipts"] });
      router.push(routes.inventory.receipts.detail(created.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to create purchase receipt.");
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
      ) : (
        <PurchaseReceiptForm
          suppliers={suppliers}
          productItems={itemsData?.items ?? []}
          submitLabel="Save draft"
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
        />
      )}
    </DashboardPageShell>
  );
}
