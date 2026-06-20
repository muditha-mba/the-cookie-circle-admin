"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { TaxChargeForm } from "@/components/charges/TaxChargeForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { taxChargeModule } from "@/config/charge-modules";
import { taxChargesApi } from "@/lib/api/tax-charges";
import type { ApiError } from "@/lib/api/types";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { TaxChargeFormValues } from "@/lib/validation/charge";

export function TaxChargeNewPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: TaxChargeFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await taxChargesApi.create({
        name: values.name,
        description: values.description || null,
        charge_type: values.charge_type,
        amount: values.amount,
        is_active: values.is_active,
      });
      cacheEntitySave(queryClient, [taxChargeModule.queryKey, created.id], [taxChargeModule.queryKey], created);
      router.push(taxChargeModule.routes.detail(created.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to create tax charge.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPageShell
      title="Create Tax Charge"
      description="Define a new order-level tax or fee."
    >
      <PageActions backHref={taxChargeModule.routes.list} className="mb-6" />
      <TaxChargeForm
        submitLabel="Create tax charge"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
