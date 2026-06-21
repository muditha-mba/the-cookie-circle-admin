"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { BusinessSettingsPageShell } from "@/components/business-settings/BusinessSettingsPageShell";
import { ContactSettingsForm } from "@/components/business-settings/ContactSettingsForm";
import type { ApiError } from "@/lib/api/types";
import { businessSettingsApi } from "@/lib/api/business-settings";
import type { ContactSettingsFormValues } from "@/lib/validation/contact-settings";

export default function ContactSettingsPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["business-settings"],
    queryFn: () => businessSettingsApi.get(),
  });

  const handleSubmit = async (values: ContactSettingsFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await businessSettingsApi.update(values);
      queryClient.setQueryData(["business-settings"], updated);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to update contact settings.");
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
        <p className="text-sm text-danger">Contact settings could not be loaded.</p>
      </BusinessSettingsPageShell>
    );
  }

  return (
    <BusinessSettingsPageShell>
      <ContactSettingsForm
        defaultValues={data}
        submitLabel="Save contact details"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </BusinessSettingsPageShell>
  );
}
