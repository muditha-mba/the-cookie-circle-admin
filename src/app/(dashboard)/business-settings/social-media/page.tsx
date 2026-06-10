"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { BusinessSettingsPageShell } from "@/components/business-settings/BusinessSettingsPageShell";
import { SocialMediaForm } from "@/components/business-settings/SocialMediaForm";
import type { ApiError } from "@/lib/api/types";
import { socialMediaApi } from "@/lib/api/social-media";
import type { SocialMediaSettingsFormValues } from "@/lib/validation/social-media";

export default function SocialMediaSettingsPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["social-media-settings"],
    queryFn: () => socialMediaApi.get(),
  });

  const handleSubmit = async (values: SocialMediaSettingsFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await socialMediaApi.update(
        values.links.map((link) => ({
          platform: link.platform,
          url: link.url,
          is_enabled: link.is_enabled,
        })),
      );
      queryClient.setQueryData(["social-media-settings"], updated);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to update social media settings.");
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
        <p className="text-sm text-danger">Social media settings could not be loaded.</p>
      </BusinessSettingsPageShell>
    );
  }

  return (
    <BusinessSettingsPageShell>
      <SocialMediaForm
        defaultValues={data.links}
        submitLabel="Save social links"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </BusinessSettingsPageShell>
  );
}
