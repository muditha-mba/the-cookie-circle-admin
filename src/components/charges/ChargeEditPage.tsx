"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { ChargeForm } from "@/components/charges/ChargeForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import type { ChargeModuleId } from "@/config/charge-modules";
import { getChargeModule } from "@/config/charge-modules.client";
import type { ApiError } from "@/lib/api/types";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { ChargeFormValues } from "@/lib/validation/charge";

type ChargeEditPageProps = {
  moduleId: ChargeModuleId;
};

export function ChargeEditPage({ moduleId }: ChargeEditPageProps) {
  const module = getChargeModule(moduleId);
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: [module.queryKey, params.id],
    queryFn: () => module.api.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleSubmit = async (values: ChargeFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await module.api.update(params.id, {
        name: values.name,
        description: values.description || null,
        charge_type: values.charge_type,
        amount: values.amount,
        applicability: values.applicability,
        is_active: values.is_active,
      });
      cacheEntitySave(
        queryClient,
        [module.queryKey, params.id],
        [module.queryKey],
        updated,
        { alsoInvalidate: [["products"], ["collections"]] },
      );
      router.push(module.routes.detail(params.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? `Unable to update ${module.singular.toLowerCase()}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPageShell title={`Edit ${module.singular}`} description="Loading...">
        <div className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title={`Edit ${module.singular}`} description="Not found">
        <p className="text-sm text-danger">{module.singular} not found.</p>
        <PageActions backHref={module.routes.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={`Edit ${data.name}`}
      description={`Update ${module.singular.toLowerCase()} details.`}
    >
      <PageActions backHref={module.routes.detail(params.id)} className="mb-6" />
      <ChargeForm
        defaultValues={{
          name: data.name,
          description: data.description ?? "",
          charge_type: data.charge_type,
          amount: Number(data.amount),
          applicability: data.applicability,
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
