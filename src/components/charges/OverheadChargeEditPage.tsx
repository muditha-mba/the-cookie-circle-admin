"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { OverheadChargeForm } from "@/components/charges/OverheadChargeForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import type { OverheadModuleMeta } from "@/config/charge-modules";
import type { OverheadChargeApi } from "@/lib/api/charge-types";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { OverheadChargeFormValues } from "@/lib/validation/charge";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

type OverheadChargeEditPageProps = {
  module: OverheadModuleMeta;
  api: OverheadChargeApi;
};

export function OverheadChargeEditPage({ module, api }: OverheadChargeEditPageProps) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: [module.queryKey, params.id],
    queryFn: () => api.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleSubmit = async (values: OverheadChargeFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await api.update(params.id, {
        name: values.name,
        description: values.description || null,
        is_active: values.is_active,
      });
      cacheEntitySave(queryClient, [module.queryKey, updated.id], [module.queryKey], updated);
      notifyActionSuccess("Changes saved successfully.");
      router.push(module.routes.detail(updated.id));
    } catch (err) {
      notifyActionError(err, `Unable to update ${module.singular.toLowerCase()}.`, setError);
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
      title={`Edit ${module.singular}`}
      description={`Update ${data.name}.`}
    >
      <PageActions backHref={module.routes.detail(params.id)} className="mb-6" />
      <OverheadChargeForm
        defaultValues={{
          name: data.name,
          description: data.description ?? "",
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
