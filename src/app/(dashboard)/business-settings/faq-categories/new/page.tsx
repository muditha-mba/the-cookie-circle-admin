"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BusinessSettingsPageShell } from "@/components/business-settings/BusinessSettingsPageShell";
import { FaqCategoryForm } from "@/components/business-settings/FaqCategoryForm";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { faqCategoriesApi } from "@/lib/api/faq-categories";
import type { FaqCategoryFormValues } from "@/lib/validation/faq-category";

export default function NewFaqCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: existingCategories } = useQuery({
    queryKey: ["faq-categories"],
    queryFn: () => faqCategoriesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (values: FaqCategoryFormValues) => faqCategoriesApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-categories"] });
      router.push(routes.businessSettings.faqs.list);
    },
    onError: (err: ApiError) => {
      setError(err.message ?? "Unable to create category.");
    },
  });

  const nextSortOrder =
    existingCategories?.reduce((max, category) => Math.max(max, category.sort_order), -1) ?? -1;

  return (
    <BusinessSettingsPageShell>
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">New FAQ category</h2>
          <p className="mt-1 text-sm text-text-muted">
            Create a topic group for the client FAQ page.
          </p>
        </div>
        <FaqCategoryForm
          defaultValues={{ sort_order: nextSortOrder + 1 }}
          submitLabel="Create category"
          isSubmitting={createMutation.isPending}
          error={error}
          onSubmit={async (values) => {
            setError(null);
            await createMutation.mutateAsync(values);
          }}
        />
      </div>
    </BusinessSettingsPageShell>
  );
}
