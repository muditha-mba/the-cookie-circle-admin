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
import { suppliersApi } from "@/lib/api/suppliers";
import type { ApiError } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";
import { cacheEntityRemove } from "@/lib/query/mutation-cache";

export default function SupplierDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirmDelete, deleteDialog, isConfirming } = useConfirmDelete();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["suppliers", params.id],
    queryFn: () => suppliersApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleDelete = () => {
    if (!data) {
      return;
    }

    confirmDelete({
      message: `Are you sure you want to delete ${data.supplier_name}? This action cannot be undone.`,
      onConfirm: async () => {
        setDeleteError(null);
        try {
          await suppliersApi.delete(data.id);
          cacheEntityRemove(queryClient, ["suppliers", data.id], ["suppliers"]);
          router.push(routes.suppliers.list);
        } catch (err) {
          const apiError = err as ApiError;
          setDeleteError(apiError.message ?? "Unable to delete supplier.");
        }
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Supplier" description="Loading...">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Supplier" description="Not found">
        <p className="text-sm text-danger">Supplier not found.</p>
        <PageActions backHref={routes.suppliers.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell title={data.supplier_name} description="Supplier details.">
      {deleteDialog}
      <PageActions backHref={routes.suppliers.list} className="mb-6">
        <PrimaryLink href={routes.suppliers.edit(data.id)}>Edit</PrimaryLink>
        <SecondaryButton variant="danger" disabled={isConfirming} onClick={handleDelete}>
          {isConfirming ? "Deleting..." : "Delete"}
        </SecondaryButton>
      </PageActions>

      {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}

      <DetailMetadataCard>
        <DetailField label="Status" value={<StatusBadge active={data.is_active} />} />
        <DetailField label="Contact person" value={data.contact_person || "—"} />
        <DetailField label="Email" value={data.email || "—"} />
        <DetailField label="Phone" value={data.phone || "—"} />
        <DetailField label="Updated" value={formatDateTime(data.updated_at)} />
        <DetailField label="Notes" value={data.notes || "—"} fullWidth />
      </DetailMetadataCard>
    </DashboardPageShell>
  );
}
