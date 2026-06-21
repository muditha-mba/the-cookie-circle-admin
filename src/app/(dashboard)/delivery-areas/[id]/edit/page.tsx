"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { DeliveryAreaForm } from "@/components/delivery-areas/DeliveryAreaForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import { deliveryAreasApi } from "@/lib/api/delivery-areas";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { DeliveryAreaFormValues } from "@/lib/validation/delivery-area";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

function toPayload(values: DeliveryAreaFormValues) {
  return {
    name: values.name,
    description: values.description || null,
    delivery_fee_override:
      !values.delivery_fee_override?.trim()
        ? null
        : Number(values.delivery_fee_override),
    pickup_only: values.pickup_only,
    is_active: values.is_active,
  };
}

export default function EditDeliveryAreaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["delivery-areas", params.id],
    queryFn: () => deliveryAreasApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleSubmit = async (values: DeliveryAreaFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await deliveryAreasApi.update(params.id, toPayload(values));
      cacheEntitySave(queryClient, ["delivery-areas", params.id], ["delivery-areas"], updated);
      notifyActionSuccess("Changes saved successfully.");
      router.push(routes.deliveryAreas.detail(params.id));
    } catch (err) {
      notifyActionError(err, "Unable to update delivery area.", setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Edit Delivery Area" description="Loading...">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Edit Delivery Area" description="Not found">
        <p className="text-sm text-danger">Delivery area not found.</p>
        <PageActions backHref={routes.deliveryAreas.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell title={`Edit ${data.name}`} description="Update delivery area settings.">
      <PageActions backHref={routes.deliveryAreas.detail(params.id)} className="mb-6" />
      <DeliveryAreaForm
        defaultValues={{
          name: data.name,
          description: data.description ?? "",
          delivery_fee_override: data.delivery_fee_override ?? "",
          pickup_only: data.pickup_only,
          is_active: data.is_active,
        }}
        submitLabel="Save changes"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
