"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { PageActions, PrimaryLink, SecondaryButton } from "@/components/data/PageActions";
import { DetailField } from "@/components/data/DetailField";
import { DetailMetadataCard } from "@/components/data/DetailMetadataCard";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { ProductCostBreakdownView } from "@/components/products/ProductCostBreakdownView";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { productsApi } from "@/lib/api/products";
import { cacheEntityRemove } from "@/lib/query/mutation-cache";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canViewFinancials } = useAdminPermissions();
  const { confirmDelete, deleteDialog, isConfirming } = useConfirmDelete();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", params.id],
    queryFn: () => productsApi.get(params.id),
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
          await productsApi.delete(data.id);
          cacheEntityRemove(queryClient, ["products", data.id], ["products"]);
          router.push(routes.products.list);
        } catch (err) {
          const apiError = err as ApiError;
          setDeleteError(apiError.message ?? "Unable to delete product.");
        }
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Product" description="Loading...">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Product" description="Not found">
        <p className="text-sm text-danger">Product not found.</p>
        <PageActions backHref={routes.products.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={data.name}
      description={
        canViewFinancials
          ? "Full cost breakdown and profitability analysis."
          : "Product configuration and production details."
      }
    >
      {deleteDialog}
      <PageActions backHref={routes.products.list} className="mb-6">
        <PrimaryLink href={routes.products.edit(data.id)}>Edit</PrimaryLink>
        <SecondaryButton
          variant="danger"
          disabled={isConfirming}
          onClick={handleDelete}
        >
          {isConfirming ? "Deleting..." : "Delete"}
        </SecondaryButton>
      </PageActions>

      {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}

      <DetailMetadataCard>
        <DetailField label="Status" value={<StatusBadge active={data.is_active} />} />
        {canViewFinancials ? (
          <>
            <DetailField label="Selling price" value={formatCurrency(data.selling_price)} />
            <DetailField label="Buffer" value={formatCurrency(data.buffer_amount)} />
          </>
        ) : null}
        <DetailField label="Updated" value={formatDateTime(data.updated_at)} />
        <DetailField label="Description" value={data.description || "—"} />
      </DetailMetadataCard>

      {canViewFinancials && data.cost_breakdown ? (
        <ProductCostBreakdownView
          breakdown={data.cost_breakdown}
          yieldQuantity={data.yield_quantity}
          productionNotes={data.production_notes}
        />
      ) : null}
    </DashboardPageShell>
  );
}
