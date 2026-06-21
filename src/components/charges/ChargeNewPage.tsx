"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ChargeForm } from "@/components/charges/ChargeForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import type { ChargeModuleId } from "@/config/charge-modules";
import { getChargeModule } from "@/config/charge-modules.client";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { ChargeFormValues } from "@/lib/validation/charge";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

type ChargeNewPageProps = {
  moduleId: ChargeModuleId;
};

export function ChargeNewPage({ moduleId }: ChargeNewPageProps) {
  const module = getChargeModule(moduleId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: ChargeFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await module.api.create({
        name: values.name,
        description: values.description || null,
        charge_type: values.charge_type,
        amount: values.amount,
        applicability: values.applicability,
        is_active: values.is_active,
      });
      cacheEntitySave(queryClient, [module.queryKey, created.id], [module.queryKey], created, {
        alsoInvalidate: [["products"], ["collections"]],
      });
      notifyActionSuccess(`${module.singular} created successfully.`);
      router.push(module.routes.detail(created.id));
    } catch (err) {
      notifyActionError(err, `Unable to create ${module.singular.toLowerCase()}.`, setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPageShell
      title={`Create ${module.singular}`}
      description={`Add a new ${module.singular.toLowerCase()}.`}
    >
      <PageActions backHref={module.routes.list} className="mb-6" />
      <ChargeForm
        submitLabel={`Create ${module.singular.toLowerCase()}`}
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
