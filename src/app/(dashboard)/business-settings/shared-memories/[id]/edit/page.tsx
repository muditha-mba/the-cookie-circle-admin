"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

import { BusinessSettingsPageShell } from "@/components/business-settings/BusinessSettingsPageShell";
import { SharedMemoryForm } from "@/components/business-settings/SharedMemoryForm";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { sharedMemoriesApi } from "@/lib/api/shared-memories";
import type { SharedMemoryFormValues } from "@/lib/validation/shared-memory";

type EditSharedMemoryPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditSharedMemoryPage({ params }: EditSharedMemoryPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shared-memories", id],
    queryFn: () => sharedMemoriesApi.get(id),
  });

  const updateMutation = useMutation({
    meta: { successMessage: "Changes saved successfully." },
    mutationFn: (values: SharedMemoryFormValues) => sharedMemoriesApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared-memories"] });
      queryClient.invalidateQueries({ queryKey: ["shared-memories", id] });
      router.push(routes.businessSettings.sharedMemories.list);
    },
    onError: (err: ApiError) => {
      setError(err.message ?? "Unable to update shared memory.");
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
        <p className="text-sm text-danger">Shared memory could not be loaded.</p>
      </BusinessSettingsPageShell>
    );
  }

  return (
    <BusinessSettingsPageShell>
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Edit shared memory</h2>
          <p className="mt-1 text-sm text-text-muted">
            Update the preview image, post link, or website visibility.
          </p>
        </div>
        <SharedMemoryForm
          defaultValues={{
            title: data.title,
            preview_image_url: data.preview_image_url,
            post_url: data.post_url,
            platform: data.platform,
            sort_order: data.sort_order,
            is_active: data.is_active,
          }}
          submitLabel="Save changes"
          isSubmitting={updateMutation.isPending}
          error={error}
          onSubmit={async (values) => {
            setError(null);
            try {
              await updateMutation.mutateAsync(values);
            } catch {
              // Error state is handled by the mutation onError callback.
            }
          }}
        />
      </div>
    </BusinessSettingsPageShell>
  );
}
