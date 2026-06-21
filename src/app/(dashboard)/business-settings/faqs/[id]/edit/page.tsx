"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { BusinessSettingsPageShell } from "@/components/business-settings/BusinessSettingsPageShell";
import { FaqForm } from "@/components/business-settings/FaqForm";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { faqsApi } from "@/lib/api/faqs";
import type { FaqFormValues } from "@/lib/validation/faq";

export default function EditFaqPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["faqs", params.id],
    queryFn: () => faqsApi.get(params.id),
  });

  const updateMutation = useMutation({
    mutationFn: (values: FaqFormValues) => faqsApi.update(params.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      router.push(routes.businessSettings.faqs.list);
    },
    onError: (err: ApiError) => {
      setError(err.message ?? "Unable to update FAQ.");
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
        <p className="text-sm text-danger">FAQ could not be loaded.</p>
      </BusinessSettingsPageShell>
    );
  }

  return (
    <BusinessSettingsPageShell>
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Edit FAQ</h2>
          <p className="mt-1 text-sm text-text-muted">Update this website question.</p>
        </div>
        <FaqForm
        defaultValues={{
          category_id: data.category_id,
          question: data.question,
          answer: data.answer,
          sort_order: data.sort_order,
          is_active: data.is_active,
        }}
        submitLabel="Save FAQ"
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
