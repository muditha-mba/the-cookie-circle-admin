"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { CollectionPackageBadge } from "@/components/collections/CollectionPackageBadge";
import { DetailField } from "@/components/data/DetailField";
import { DetailMetadataCard } from "@/components/data/DetailMetadataCard";
import { PageActions, PrimaryLink, SecondaryButton } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { collectionPackagesApi } from "@/lib/api/collection-packages";
import { formatCount, formatCurrency, formatDateTime } from "@/lib/format";
import { cacheEntityRemove } from "@/lib/query/mutation-cache";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

export default function CollectionPackageDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirmDelete, deleteDialog, isConfirming } = useConfirmDelete();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["collection-package", params.id],
    queryFn: () => collectionPackagesApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleDelete = () => {
    if (!data) {
      return;
    }

    confirmDelete({
      message: `Are you sure you want to delete "${data.name}"? Linked packages may be affected. This action cannot be undone.`,
      onConfirm: async () => {
        setDeleteError(null);
        try {
          await collectionPackagesApi.delete(data.id);
          notifyActionSuccess("Collection deleted successfully.");
          cacheEntityRemove(
            queryClient,
            ["collection-package", data.id],
            ["collection-packages"],
            { alsoInvalidate: [["collections"]] },
          );
          router.push(routes.collectionPackages.list);
        } catch (err) {
      notifyActionError(err, "Unable to delete collection.", setDeleteError);
    }
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Collection" description="Loading...">
        <div className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Collection" description="Not found">
        <p className="text-sm text-danger">Collection not found.</p>
        <PageActions backHref={routes.collectionPackages.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  const feeModeLabel =
    data.packaging_fee_mode === "per_cookie" ? "Per cookie" : "Flat fee";

  return (
    <DashboardPageShell title={data.name} description="Collection type details.">
      {deleteDialog}
      <PageActions backHref={routes.collectionPackages.list} className="mb-6">
        <PrimaryLink href={routes.collectionPackages.edit(data.id)}>Edit</PrimaryLink>
        <SecondaryButton variant="danger" disabled={isConfirming} onClick={handleDelete}>
          {isConfirming ? "Deleting..." : "Delete"}
        </SecondaryButton>
      </PageActions>
      {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}
      <DetailMetadataCard>
        <DetailField label="Code" value={data.code} />
        <DetailField
          label="Badge"
          value={<CollectionPackageBadge name={data.name} tone={data.badge_tone} />}
        />
        <DetailField label="Status" value={<StatusBadge active={data.is_active} />} />
        <DetailField
          label="Quantity range"
          value={`${formatCount(data.min_quantity)} – ${formatCount(data.max_quantity)} cookies`}
        />
        <DetailField label="Packaging fee mode" value={feeModeLabel} />
        <DetailField
          label="Packaging fee"
          value={formatCurrency(data.packaging_fee_amount)}
        />
        <DetailField label="Created" value={formatDateTime(data.created_at)} />
        <DetailField label="Updated" value={formatDateTime(data.updated_at)} />
        <DetailField label="Description" value={data.description || "—"} />
      </DetailMetadataCard>
    </DashboardPageShell>
  );
}
