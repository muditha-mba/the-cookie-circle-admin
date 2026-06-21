"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { TaxChargeForm } from "@/components/charges/TaxChargeForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { taxChargeModule } from "@/config/charge-modules";
import { taxChargesApi } from "@/lib/api/tax-charges";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { TaxChargeFormValues } from "@/lib/validation/charge";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

export function TaxChargeEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: [taxChargeModule.queryKey, params.id],
    queryFn: () => taxChargesApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleSubmit = async (values: TaxChargeFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await taxChargesApi.update(params.id, {
        name: values.name,
        description: values.description || null,
        charge_type: values.charge_type,
        amount: values.amount,
        is_active: values.is_active,
      });
      cacheEntitySave(queryClient, [taxChargeModule.queryKey, params.id], [taxChargeModule.queryKey], updated);
      notifyActionSuccess("Changes saved successfully.");
      router.push(taxChargeModule.routes.detail(params.id));
    } catch (err) {
      notifyActionError(err, "Unable to update tax charge.", setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Edit Tax Charge" description="Loading...">
        <div className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Edit Tax Charge" description="Not found">
        <p className="text-sm text-danger">Tax charge not found.</p>
        <PageActions backHref={taxChargeModule.routes.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell title={`Edit ${data.name}`} description="Update tax charge details.">
      <PageActions backHref={taxChargeModule.routes.detail(params.id)} className="mb-6" />
      <TaxChargeForm
        defaultValues={{
          name: data.name,
          description: data.description ?? "",
          charge_type: data.charge_type,
          amount: Number(data.amount),
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
