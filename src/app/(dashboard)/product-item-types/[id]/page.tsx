"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { DetailField } from "@/components/data/DetailField";
import { DetailMetadataCard } from "@/components/data/DetailMetadataCard";
import { PageActions, PrimaryLink, SecondaryButton } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { productItemTypesApi } from "@/lib/api/product-item-types";
import { cacheEntityRemove } from "@/lib/query/mutation-cache";
import { formatDateTime } from "@/lib/format";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

export default function ProductItemTypeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirmDelete, deleteDialog, isConfirming } = useConfirmDelete();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product-item-type", params.id],
    queryFn: () => productItemTypesApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleDelete = () => {
    if (!data) {
      return;
    }

    confirmDelete({
      message: `Are you sure you want to delete "${data.name}"? This cannot be undone if product items are linked.`,
      onConfirm: async () => {
        setDeleteError(null);
        try {
          await productItemTypesApi.delete(data.id);
          notifyActionSuccess("Product item type deleted successfully.");
          cacheEntityRemove(
            queryClient,
            ["product-item-type", data.id],
            ["product-item-types"],
            { alsoInvalidate: [["product-item-types", "all"], ["product-items"]] },
          );
          router.push(routes.productItemTypes.list);
        } catch (err) {
      notifyActionError(err, "Unable to delete product item type.", setDeleteError);
    }
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Product Item Type" description="Loading...">
        <div className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Product Item Type" description="Not found">
        <p className="text-sm text-danger">Product item type not found.</p>
        <PageActions backHref={routes.productItemTypes.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell title={data.name} description="Product item type details.">
      {deleteDialog}
      <PageActions backHref={routes.productItemTypes.list} className="mb-6">
        <PrimaryLink href={routes.productItemTypes.edit(data.id)}>Edit</PrimaryLink>
        <SecondaryButton variant="danger" disabled={isConfirming} onClick={handleDelete}>
          {isConfirming ? "Deleting..." : "Delete"}
        </SecondaryButton>
      </PageActions>

      {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}

      <DetailMetadataCard>
        <DetailField label="Name" value={data.name} />
        <DetailField label="Status" value={<StatusBadge active={data.is_active} />} />
        <DetailField label="Created" value={formatDateTime(data.created_at)} />
        <DetailField label="Updated" value={formatDateTime(data.updated_at)} />
        <DetailField label="Description" value={data.description || "—"} />
      </DetailMetadataCard>

      <p className="mt-6 text-sm text-text-secondary">
        <Link
          href={routes.productItems.list}
          className="text-text-primary underline-offset-4 hover:underline"
        >
          View product items
        </Link>{" "}
        using this type.
      </p>
    </DashboardPageShell>
  );
}
