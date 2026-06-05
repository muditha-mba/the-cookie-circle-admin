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
import type { ApiError } from "@/lib/api/types";
import { collectionsApi } from "@/lib/api/collections";
import { cacheEntityRemove } from "@/lib/query/mutation-cache";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default function CollectionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["collections", params.id],
    queryFn: () => collectionsApi.get(params.id),
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
      await collectionsApi.delete(data.id);
      cacheEntityRemove(queryClient, ["collections", data.id], ["collections"]);
      router.push(routes.collections.list);
    } catch (err) {
      const apiError = err as ApiError;
      setDeleteError(apiError.message ?? "Unable to delete collection.");
    } finally {
      setIsDeleting(false);
    }
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
      <PageActions backHref={routes.collections.list} className="mb-6">
        <PrimaryLink href={routes.collections.edit(data.id)}>Edit</PrimaryLink>
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
        <DetailField
          label="Package"
          value={<CollectionPackageBadge name={data.package.name} tone={data.package.badge_tone} />}
        />
        <DetailField label="Status" value={<StatusBadge active={data.is_active} />} />
        <DetailField label="Public" value={data.is_public ? "Yes" : "No"} />
        <DetailField label="Package size" value={`${data.package_size} cookies`} />
        <DetailField label="Package fee" value={formatCurrency(data.package_fee)} />
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
                {line.product_item_name} — {line.quantity} {line.unit}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </DashboardPageShell>
  );
}
