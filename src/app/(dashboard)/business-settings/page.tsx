"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { BusinessSettingsForm } from "@/components/business-settings/BusinessSettingsForm";
import { BusinessSettingsPageShell } from "@/components/business-settings/BusinessSettingsPageShell";
import { businessSettingsApi } from "@/lib/api/business-settings";
import type { BusinessSettingsFormValues } from "@/lib/validation/business-settings";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

export default function BusinessSettingsPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["business-settings"],
    queryFn: () => businessSettingsApi.get(),
  });

  const handleSubmit = async (values: BusinessSettingsFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await businessSettingsApi.update(values);
      queryClient.setQueryData(["business-settings"], updated);
      notifyActionSuccess("Settings saved successfully.");
    } catch (err) {
      notifyActionError(err, "Unable to update settings.", setError);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <p className="text-sm text-danger">Settings could not be loaded.</p>
      </BusinessSettingsPageShell>
    );
  }

  return (
    <BusinessSettingsPageShell>
      <BusinessSettingsForm
        defaultValues={data}
        submitLabel="Save settings"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </BusinessSettingsPageShell>
  );
}
