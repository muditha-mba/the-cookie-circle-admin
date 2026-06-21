"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BusinessSettingsPageShell } from "@/components/business-settings/BusinessSettingsPageShell";
import { FaqForm } from "@/components/business-settings/FaqForm";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { faqCategoriesApi } from "@/lib/api/faq-categories";
import { faqsApi } from "@/lib/api/faqs";
import type { FaqFormValues } from "@/lib/validation/faq";

export default function NewFaqPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: existingFaqs } = useQuery({
    queryKey: ["faqs"],
    queryFn: () => faqsApi.list(),
  });

  const { data: categories } = useQuery({
    queryKey: ["faq-categories"],
    queryFn: () => faqCategoriesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (values: FaqFormValues) => faqsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      router.push(routes.businessSettings.faqs.list);
    },
    onError: (err: ApiError) => {
      setError(err.message ?? "Unable to create FAQ.");
    },
  });

  const nextSortOrder =
    existingFaqs?.reduce((max, faq) => Math.max(max, faq.sort_order), -1) ?? -1;

  return (
    <BusinessSettingsPageShell>
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">New FAQ</h2>
          <p className="mt-1 text-sm text-text-muted">
            Add a question for the client website FAQ page.
          </p>
        </div>
        <FaqForm
        defaultValues={{
          category_id: categories?.[0]?.id ?? "",
          sort_order: nextSortOrder + 1,
        }}
        submitLabel="Create FAQ"
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
