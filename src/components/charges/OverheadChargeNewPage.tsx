"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { OverheadChargeForm } from "@/components/charges/OverheadChargeForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import type { OverheadModuleMeta } from "@/config/charge-modules";
import type { OverheadChargeApi } from "@/lib/api/charge-types";
import type { ApiError } from "@/lib/api/types";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { OverheadChargeFormValues } from "@/lib/validation/charge";

type OverheadChargeNewPageProps = {
  module: OverheadModuleMeta;
  api: OverheadChargeApi;
};

export function OverheadChargeNewPage({ module, api }: OverheadChargeNewPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: OverheadChargeFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await api.create({
        name: values.name,
        description: values.description || null,
        is_active: values.is_active,
      });
      cacheEntitySave(queryClient, [module.queryKey, created.id], [module.queryKey], created);
      router.push(module.routes.detail(created.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? `Unable to create ${module.singular.toLowerCase()}.`);
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
      <OverheadChargeForm
        submitLabel={`Create ${module.singular.toLowerCase()}`}
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
