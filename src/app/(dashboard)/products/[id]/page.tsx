"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { PageActions, PrimaryLink, SecondaryButton } from "@/components/data/PageActions";
import { DetailField } from "@/components/data/DetailField";
import { DetailMetadataCard } from "@/components/data/DetailMetadataCard";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { ProductCostBreakdownView } from "@/components/products/ProductCostBreakdownView";
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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", params.id],
    queryFn: () => productsApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleDelete = async () => {
    if (!data) {
      return;
    }
    if (!window.confirm(`Delete "${data.name}"? This cannot be undone.`)) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);
    try {
      await productsApi.delete(data.id);
      cacheEntityRemove(queryClient, ["products", data.id], ["products"]);
      router.push(routes.products.list);
    } catch (err) {
      const apiError = err as ApiError;
      setDeleteError(apiError.message ?? "Unable to delete product.");
    } finally {
      setIsDeleting(false);
    }
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
      description="Full cost breakdown and profitability analysis."
    >
      <PageActions backHref={routes.products.list} className="mb-6">
        <PrimaryLink href={routes.products.edit(data.id)}>Edit</PrimaryLink>
        <SecondaryButton
          variant="danger"
          disabled={isDeleting}
          onClick={() => void handleDelete()}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </SecondaryButton>
      </PageActions>

      {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}

      <DetailMetadataCard>
        <DetailField label="Status" value={<StatusBadge active={data.is_active} />} />
        <DetailField label="Selling price" value={formatCurrency(data.selling_price)} />
        <DetailField label="Buffer" value={formatCurrency(data.buffer_amount)} />
        <DetailField label="Updated" value={formatDateTime(data.updated_at)} />
        <DetailField label="Description" value={data.description || "—"} />
      </DetailMetadataCard>

      <ProductCostBreakdownView
        breakdown={data.cost_breakdown}
        yieldQuantity={data.yield_quantity}
        productionNotes={data.production_notes}
      />
    </DashboardPageShell>
  );
}
