"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { BusinessSettingsPageShell } from "@/components/business-settings/BusinessSettingsPageShell";
import { SocialMediaForm } from "@/components/business-settings/SocialMediaForm";
import { socialMediaApi } from "@/lib/api/social-media";
import type { SocialMediaSettingsFormValues } from "@/lib/validation/social-media";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

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
      notifyActionSuccess("Social media settings saved successfully.");
    } catch (err) {
      notifyActionError(err, "Unable to update social media settings.", setError);
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
