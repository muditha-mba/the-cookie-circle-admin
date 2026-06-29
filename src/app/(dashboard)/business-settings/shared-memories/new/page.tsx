"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { BusinessSettingsPageShell } from "@/components/business-settings/BusinessSettingsPageShell";
import { SharedMemoryForm } from "@/components/business-settings/SharedMemoryForm";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { sharedMemoriesApi } from "@/lib/api/shared-memories";
import type { SharedMemoryFormValues } from "@/lib/validation/shared-memory";

export default function NewSharedMemoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: existingMemories } = useQuery({
    queryKey: ["shared-memories"],
    queryFn: () => sharedMemoriesApi.list(),
  });

  const createMutation = useMutation({
    meta: { successMessage: "Shared memory created successfully." },
    mutationFn: (values: SharedMemoryFormValues) => sharedMemoriesApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared-memories"] });
      router.push(routes.businessSettings.sharedMemories.list);
    },
    onError: (err: ApiError) => {
      setError(err.message ?? "Unable to create shared memory.");
    },
  });

  const nextSortOrder =
    existingMemories?.reduce((max, memory) => Math.max(max, memory.sort_order), -1) ?? -1;

  return (
    <BusinessSettingsPageShell>
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">New shared memory</h2>
          <p className="mt-1 text-sm text-text-muted">
            Add a customer social media post for the home page carousel.
          </p>
        </div>
        <SharedMemoryForm
          defaultValues={{ sort_order: nextSortOrder + 1 }}
          submitLabel="Create post"
          isSubmitting={createMutation.isPending}
          error={error}
          onSubmit={async (values) => {
            setError(null);
            try {
              await createMutation.mutateAsync(values);
            } catch {
              // Error state is handled by the mutation onError callback.
            }
          }}
        />
      </div>
    </BusinessSettingsPageShell>
  );
}
