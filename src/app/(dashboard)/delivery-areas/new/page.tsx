"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DeliveryAreaForm } from "@/components/delivery-areas/DeliveryAreaForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import { deliveryAreasApi } from "@/lib/api/delivery-areas";
import type { ApiError } from "@/lib/api/types";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { DeliveryAreaFormValues } from "@/lib/validation/delivery-area";

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

export default function NewDeliveryAreaPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: DeliveryAreaFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await deliveryAreasApi.create(toPayload(values));
      cacheEntitySave(queryClient, ["delivery-areas", created.id], ["delivery-areas"], created);
      router.push(routes.deliveryAreas.detail(created.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to create delivery area.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPageShell title="Create Delivery Area" description="Add a delivery zone or pickup option.">
      <PageActions backHref={routes.deliveryAreas.list} className="mb-6" />
      <DeliveryAreaForm submitLabel="Create area" isSubmitting={isSubmitting} error={error} onSubmit={handleSubmit} />
    </DashboardPageShell>
  );
}
