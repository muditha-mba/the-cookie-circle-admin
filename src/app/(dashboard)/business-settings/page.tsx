"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { BusinessSettingsForm } from "@/components/business-settings/BusinessSettingsForm";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import type { ApiError } from "@/lib/api/types";
import { businessSettingsApi } from "@/lib/api/business-settings";
import type { BusinessSettingsFormValues } from "@/lib/validation/business-settings";

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
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to update settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Business Settings" description="Loading...">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Business Settings" description="Unable to load settings">
        <p className="text-sm text-danger">Settings could not be loaded.</p>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title="Business Settings"
      description="Operational settings for delivery scheduling, fees, and payment options."
    >
      <BusinessSettingsForm
        defaultValues={data}
        submitLabel="Save settings"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
