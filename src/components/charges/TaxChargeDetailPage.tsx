"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { DetailField } from "@/components/data/DetailField";
import { DetailMetadataCard } from "@/components/data/DetailMetadataCard";
import { PageActions, PrimaryLink, SecondaryButton } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { taxChargeModule } from "@/config/charge-modules";
import { taxChargesApi } from "@/lib/api/tax-charges";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import type { ApiError } from "@/lib/api/types";
import { formatChargeAmount, formatDateTime } from "@/lib/format";
import { cacheEntityRemove } from "@/lib/query/mutation-cache";

export function TaxChargeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirmDelete, deleteDialog, isConfirming } = useConfirmDelete();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: [taxChargeModule.queryKey, params.id],
    queryFn: () => taxChargesApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => taxChargesApi.delete(params.id),
  });

  const handleDelete = () => {
    if (!data) return;
    confirmDelete({
      message: `Are you sure you want to delete "${data.name}"? This tax will no longer be applied to new orders.`,
      onConfirm: async () => {
        setDeleteError(null);
        try {
          await deleteMutation.mutateAsync();
          cacheEntityRemove(queryClient, [taxChargeModule.queryKey, data.id], [taxChargeModule.queryKey]);
          router.push(taxChargeModule.routes.list);
        } catch (err) {
          const apiError = err as ApiError;
          setDeleteError(apiError.message ?? "Unable to delete tax charge.");
        }
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Tax Charge" description="Loading...">
        <div className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Tax Charge" description="Not found">
        <p className="text-sm text-danger">Tax charge not found.</p>
        <PageActions backHref={taxChargeModule.routes.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell title={data.name} description="Tax charge details.">
      {deleteDialog}
      <PageActions backHref={taxChargeModule.routes.list} className="mb-6">
        <PrimaryLink href={taxChargeModule.routes.edit(data.id)}>Edit</PrimaryLink>
        <SecondaryButton variant="danger" disabled={isConfirming} onClick={handleDelete}>
          {isConfirming ? "Deleting..." : "Delete"}
        </SecondaryButton>
      </PageActions>

      {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}

      <DetailMetadataCard>
        <DetailField label="Name" value={data.name} />
        <DetailField
          label="Status"
          value={<StatusBadge active={data.is_active} />}
        />
        <DetailField
          label="Charge type"
          value={<span className="capitalize">{data.charge_type}</span>}
        />
        <DetailField
          label="Amount"
          value={formatChargeAmount(data.amount, data.charge_type)}
        />
        <DetailField label="Created" value={formatDateTime(data.created_at)} />
        <DetailField label="Updated" value={formatDateTime(data.updated_at)} />
        <DetailField label="Description" value={data.description || "—"} />
      </DetailMetadataCard>
    </DashboardPageShell>
  );
}
