"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { DetailField } from "@/components/data/DetailField";
import { DetailMetadataCard } from "@/components/data/DetailMetadataCard";
import { PageActions, PrimaryLink, SecondaryButton } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ChargeModuleId } from "@/config/charge-modules";
import { getChargeModule } from "@/config/charge-modules.client";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import type { ApiError } from "@/lib/api/types";
import { formatChargeAmount, formatDateTime } from "@/lib/format";
import { formatChargeApplicability } from "@/lib/charge-applicability";
import { cacheEntityRemove } from "@/lib/query/mutation-cache";

type ChargeDetailPageProps = {
  moduleId: ChargeModuleId;
};

export function ChargeDetailPage({ moduleId }: ChargeDetailPageProps) {
  const module = getChargeModule(moduleId);
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirmDelete, deleteDialog, isConfirming } = useConfirmDelete();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: [module.queryKey, params.id],
    queryFn: () => module.api.get(params.id),
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
          await module.api.delete(data.id);
          cacheEntityRemove(queryClient, [module.queryKey, data.id], [module.queryKey], {
            alsoInvalidate: [["products"], ["collections"]],
          });
          router.push(module.routes.list);
        } catch (err) {
          const apiError = err as ApiError;
          setDeleteError(apiError.message ?? `Unable to delete ${module.singular.toLowerCase()}.`);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardPageShell title={module.singular} description="Loading...">
        <div className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title={module.singular} description="Not found">
        <p className="text-sm text-danger">{module.singular} not found.</p>
        <PageActions backHref={module.routes.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell title={data.name} description={`${module.singular} details.`}>
      {deleteDialog}
      <PageActions backHref={module.routes.list} className="mb-6">
        <PrimaryLink href={module.routes.edit(data.id)}>Edit</PrimaryLink>
        <SecondaryButton variant="danger" disabled={isConfirming} onClick={handleDelete}>
          {isConfirming ? "Deleting..." : "Delete"}
        </SecondaryButton>
      </PageActions>

      {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}

      <DetailMetadataCard>
        <DetailField label="Name" value={data.name} />
        <DetailField label="Status" value={<StatusBadge active={data.is_active} />} />
        <DetailField
          label="Charge type"
          value={<span className="capitalize">{data.charge_type}</span>}
        />
        <DetailField
          label="Amount"
          value={formatChargeAmount(data.amount, data.charge_type)}
        />
        <DetailField
          label="Applicability"
          value={formatChargeApplicability(data.applicability)}
        />
        <DetailField label="Created" value={formatDateTime(data.created_at)} />
        <DetailField label="Updated" value={formatDateTime(data.updated_at)} />
        <DetailField label="Description" value={data.description || "—"} />
      </DetailMetadataCard>
    </DashboardPageShell>
  );
}
