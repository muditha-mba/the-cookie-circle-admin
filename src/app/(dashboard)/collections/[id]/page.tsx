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
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { collectionsApi } from "@/lib/api/collections";
import { cacheEntityRemove } from "@/lib/query/mutation-cache";
import { formatCount, formatCurrency, formatDateTime, formatQuantity } from "@/lib/format";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

export default function CollectionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canViewFinancials } = useAdminPermissions();
  const { confirmDelete, deleteDialog, isConfirming } = useConfirmDelete();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["collections", params.id],
    queryFn: () => collectionsApi.get(params.id),
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
          await collectionsApi.delete(data.id);
          cacheEntityRemove(queryClient, ["collections", data.id], ["collections"]);
          notifyActionSuccess("Collection deleted successfully.");
          router.push(routes.collections.list);
        } catch (err) {
      notifyActionError(err, "Unable to delete collection.", setDeleteError);
    }
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Collection" description="Loading...">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Collection" description="Not found">
        <p className="text-sm text-danger">Collection not found.</p>
        <PageActions backHref={routes.collections.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={data.name}
      description="Package configuration for the customer-facing builder."
    >
      {deleteDialog}
      <PageActions backHref={routes.collections.list} className="mb-6">
        <PrimaryLink href={routes.collections.edit(data.id)}>Edit</PrimaryLink>
        <SecondaryButton variant="danger" disabled={isConfirming} onClick={handleDelete}>
          {isConfirming ? "Deleting..." : "Delete"}
        </SecondaryButton>
      </PageActions>

      {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}

      <DetailMetadataCard>
        <DetailField
          label="Package"
          value={<CollectionPackageBadge name={data.package.name} tone={data.package.badge_tone} />}
        />
        <DetailField label="Status" value={<StatusBadge active={data.is_active} />} />
        <DetailField label="Public" value={data.is_public ? "Yes" : "No"} />
        <DetailField
          label="Package size"
          value={`${formatCount(data.package_size)} cookies`}
        />
        {canViewFinancials ? (
          <DetailField label="Package fee" value={formatCurrency(data.package_fee)} />
        ) : null}
        <DetailField
          label="Allowed categories"
          value={data.allowed_categories.map((row) => row.name).join(", ") || "—"}
        />
        <DetailField label="Updated" value={formatDateTime(data.updated_at)} />
        <DetailField label="Description" value={data.description || "—"} />
      </DetailMetadataCard>

      {data.item_lines.length > 0 ? (
        <section className="mt-8 rounded-lg border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Packaging items</h2>
          <ul className="space-y-2 text-sm">
            {data.item_lines.map((line) => (
              <li key={line.id}>
                {line.product_item_name} — {formatQuantity(line.quantity, line.unit)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </DashboardPageShell>
  );
}
