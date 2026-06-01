"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { DetailField } from "@/components/data/DetailField";
import { PageActions, PrimaryLink, SecondaryButton } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { productItemTypesApi } from "@/lib/api/product-item-types";
import { formatDateTime } from "@/lib/format";

export default function ProductItemTypeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product-item-type", params.id],
    queryFn: () => productItemTypesApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleDelete = async () => {
    if (!data) {
      return;
    }
    if (
      !window.confirm(
        `Delete "${data.name}"? This cannot be undone if no product items are linked.`,
      )
    ) {
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);
    try {
      await productItemTypesApi.delete(data.id);
      router.push(routes.productItemTypes.list);
    } catch (err) {
      const apiError = err as ApiError;
      setDeleteError(apiError.message ?? "Unable to delete product item type.");
    } finally {
      setIsDeleting(false);
    }
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
      <PageActions backHref={routes.productItemTypes.list} className="mb-6">
        <PrimaryLink href={routes.productItemTypes.edit(data.id)}>Edit</PrimaryLink>
        <SecondaryButton
          variant="danger"
          disabled={isDeleting}
          onClick={() => void handleDelete()}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </SecondaryButton>
      </PageActions>

      {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}

      <dl className="grid max-w-2xl gap-6 rounded-lg border border-border bg-surface p-6 sm:grid-cols-2">
        <DetailField label="Name" value={data.name} />
        <DetailField label="Status" value={<StatusBadge active={data.is_active} />} />
        <DetailField
          label="Description"
          value={data.description || "—"}
        />
        <DetailField label="Created" value={formatDateTime(data.created_at)} />
        <DetailField label="Updated" value={formatDateTime(data.updated_at)} />
      </dl>

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
