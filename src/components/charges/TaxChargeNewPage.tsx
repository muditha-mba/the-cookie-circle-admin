"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { TaxChargeForm } from "@/components/charges/TaxChargeForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { taxChargeModule } from "@/config/charge-modules";
import { taxChargesApi } from "@/lib/api/tax-charges";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { TaxChargeFormValues } from "@/lib/validation/charge";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

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
      notifyActionSuccess("Tax charge created successfully.");
      router.push(taxChargeModule.routes.detail(created.id));
    } catch (err) {
      notifyActionError(err, "Unable to create tax charge.", setError);
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
