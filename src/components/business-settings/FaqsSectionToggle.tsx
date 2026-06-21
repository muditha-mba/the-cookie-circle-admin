"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import type { ApiError } from "@/lib/api/types";
import { faqsApi } from "@/lib/api/faqs";

export function FaqsSectionToggle() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["faqs-section-settings"],
    queryFn: () => faqsApi.getSectionSettings(),
  });

  const updateMutation = useMutation({
    meta: { successMessage: "FAQ section visibility updated." },
    mutationFn: (section_enabled: boolean) =>
      faqsApi.updateSectionSettings(section_enabled),
    onSuccess: (updated) => {
      setError(null);
      queryClient.setQueryData(["faqs-section-settings"], updated);
    },
    onError: (err: ApiError) => {
      setError(err.message ?? "Unable to update section visibility.");
    },
  });

  if (isLoading) {
    return <div className="h-20 animate-pulse rounded-lg bg-surface-hover" />;
  }

  if (isError || !data) {
    return <p className="text-sm text-danger">Section settings could not be loaded.</p>;
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Website visibility</h2>
          <p className="mt-1 text-sm text-text-muted">
            Show or hide the FAQ page and navigation links on the client website.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm text-text-primary">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            checked={data.section_enabled}
            disabled={updateMutation.isPending}
            onChange={(event) => updateMutation.mutate(event.target.checked)}
          />
          Show section on website
        </label>
      </div>

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
