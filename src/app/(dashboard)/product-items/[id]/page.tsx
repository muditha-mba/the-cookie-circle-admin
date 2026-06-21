"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { DetailField } from "@/components/data/DetailField";
import { DetailMetadataCard } from "@/components/data/DetailMetadataCard";
import { PageActions, PrimaryLink, SecondaryButton } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import type { ApiError } from "@/lib/api/types";
import { productItemsApi } from "@/lib/api/product-items";
import { cacheEntityRemove } from "@/lib/query/mutation-cache";
import { formatCurrency, formatDateTime, formatQuantity } from "@/lib/format";

export default function ProductItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirmDelete, deleteDialog, isConfirming } = useConfirmDelete();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product-item", params.id],
    queryFn: () => productItemsApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleDelete = () => {
    if (!data) {
      return;
    }

    confirmDelete({
      message: `Are you sure you want to delete "${data.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        setDeleteError(null);
        try {
          await productItemsApi.delete(data.id);
          cacheEntityRemove(queryClient, ["product-item", data.id], ["product-items"], {
            alsoInvalidate: [["products"]],
          });
          router.push(routes.productItems.list);
        } catch (err) {
          const apiError = err as ApiError;
          setDeleteError(apiError.message ?? "Unable to delete product item.");
        }
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Product Item" description="Loading...">
        <div className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Product Item" description="Not found">
        <p className="text-sm text-danger">Product item not found.</p>
        <PageActions backHref={routes.productItems.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={data.name}
      description="Purchased ingredient or packaging input. Future inventory settings (reorder level, stock tracking) will be managed on this record."
    >
      {deleteDialog}
      <PageActions backHref={routes.productItems.list} className="mb-6">
        <PrimaryLink href={routes.productItems.edit(data.id)}>Edit</PrimaryLink>
        <SecondaryButton variant="danger" disabled={isConfirming} onClick={handleDelete}>
          {isConfirming ? "Deleting..." : "Delete"}
        </SecondaryButton>
      </PageActions>

      {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}

      <DetailMetadataCard>
        <DetailField label="Name" value={data.name} />
        <DetailField label="Type" value={data.item_type.name} />
        <DetailField label="Status" value={<StatusBadge active={data.is_active} />} />
        <DetailField
          label="Purchase price"
          value={formatCurrency(data.purchase_price)}
        />
        <DetailField
          label="Purchase quantity"
          value={formatQuantity(data.purchase_quantity, data.purchase_unit)}
        />
        <DetailField
          label="Cost per unit"
          value={
            <>
              {formatCurrency(data.cost_per_unit)}{" "}
              <span className="text-text-muted">/ {data.purchase_unit}</span>
            </>
          }
        />
        <DetailField label="Created" value={formatDateTime(data.created_at)} />
        <DetailField
          label="Primary supplier"
          value={data.primary_supplier?.supplier_name ?? "—"}
        />
        <DetailField label="Updated" value={formatDateTime(data.updated_at)} />
        <DetailField label="Description" value={data.description || "—"} />
      </DetailMetadataCard>
    </DashboardPageShell>
  );
}
