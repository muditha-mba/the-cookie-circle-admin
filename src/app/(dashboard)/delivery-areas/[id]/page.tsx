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
import { deliveryAreasApi } from "@/lib/api/delivery-areas";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cacheEntityRemove } from "@/lib/query/mutation-cache";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

export default function DeliveryAreaDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirmDelete, deleteDialog, isConfirming } = useConfirmDelete();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["delivery-areas", params.id],
    queryFn: () => deliveryAreasApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleDelete = () => {
    if (!data) {
      return;
    }

    confirmDelete({
      message: `Are you sure you want to delete ${data.name}? This action cannot be undone.`,
      onConfirm: async () => {
        setDeleteError(null);
        try {
          await deliveryAreasApi.delete(data.id);
          cacheEntityRemove(queryClient, ["delivery-areas", data.id], ["delivery-areas"]);
          notifyActionSuccess("Delivery area deleted successfully.");
          router.push(routes.deliveryAreas.list);
        } catch (err) {
      notifyActionError(err, "Unable to delete delivery area.", setDeleteError);
    }
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Delivery Area" description="Loading...">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Delivery Area" description="Not found">
        <p className="text-sm text-danger">Delivery area not found.</p>
        <PageActions backHref={routes.deliveryAreas.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell title={data.name} description="Delivery area configuration.">
      {deleteDialog}
      <PageActions backHref={routes.deliveryAreas.list} className="mb-6">
        <PrimaryLink href={routes.deliveryAreas.edit(data.id)}>Edit</PrimaryLink>
        <SecondaryButton variant="danger" disabled={isConfirming} onClick={handleDelete}>
          {isConfirming ? "Deleting..." : "Delete"}
        </SecondaryButton>
      </PageActions>

      {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}

      <DetailMetadataCard>
        <DetailField label="Status" value={<StatusBadge active={data.is_active} />} />
        <DetailField label="Pickup only" value={data.pickup_only ? "Yes" : "No"} />
        <DetailField
          label="Fee override"
          value={
            data.delivery_fee_override != null
              ? formatCurrency(data.delivery_fee_override)
              : "Uses business default"
          }
        />
        <DetailField label="Updated" value={formatDateTime(data.updated_at)} />
        <DetailField label="Description" value={data.description || "—"} fullWidth />
      </DetailMetadataCard>
    </DashboardPageShell>
  );
}
