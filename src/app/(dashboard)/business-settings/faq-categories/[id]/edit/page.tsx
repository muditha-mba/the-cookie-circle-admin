"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { BusinessSettingsPageShell } from "@/components/business-settings/BusinessSettingsPageShell";
import { FaqCategoryForm } from "@/components/business-settings/FaqCategoryForm";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { faqCategoriesApi } from "@/lib/api/faq-categories";
import type { FaqCategoryFormValues } from "@/lib/validation/faq-category";

export default function EditFaqCategoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["faq-categories", params.id],
    queryFn: () => faqCategoriesApi.get(params.id),
  });

  const updateMutation = useMutation({
    mutationFn: (values: FaqCategoryFormValues) =>
      faqCategoriesApi.update(params.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-categories"] });
      router.push(routes.businessSettings.faqs.list);
    },
    onError: (err: ApiError) => {
      setError(err.message ?? "Unable to update category.");
    },
  });

  if (isLoading) {
    return (
      <BusinessSettingsPageShell>
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </BusinessSettingsPageShell>
    );
  }

  if (isError || !data) {
    return (
      <BusinessSettingsPageShell>
        <p className="text-sm text-danger">FAQ category could not be loaded.</p>
      </BusinessSettingsPageShell>
    );
  }

  return (
    <BusinessSettingsPageShell>
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Edit FAQ category</h2>
          <p className="mt-1 text-sm text-text-muted">Update this FAQ topic group.</p>
        </div>
        <FaqCategoryForm
          defaultValues={{
            name: data.name,
            sort_order: data.sort_order,
            is_active: data.is_active,
          }}
          submitLabel="Save category"
          isSubmitting={updateMutation.isPending}
          error={error}
          onSubmit={async (values) => {
            setError(null);
            await updateMutation.mutateAsync(values);
          }}
        />
      </div>
    </BusinessSettingsPageShell>
  );
}
