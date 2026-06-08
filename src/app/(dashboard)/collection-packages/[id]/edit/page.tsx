"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { CollectionPackageForm } from "@/components/collection-packages/CollectionPackageForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import { collectionPackagesApi } from "@/lib/api/collection-packages";
import type { ApiError } from "@/lib/api/types";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { CollectionPackageFormValues } from "@/lib/validation/collection-package";

export default function EditCollectionPackagePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["collection-package", params.id],
    queryFn: () => collectionPackagesApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleSubmit = async (values: CollectionPackageFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await collectionPackagesApi.update(params.id, {
        code: values.code,
        name: values.name,
        description: values.description || null,
        badge_tone: values.badge_tone,
        is_active: values.is_active,
      });
      cacheEntitySave(
        queryClient,
        ["collection-package", params.id],
        ["collection-packages"],
        updated,
        { alsoInvalidate: [["collections"]] },
      );
      router.push(routes.collectionPackages.detail(params.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to update collection package.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Edit Collection Package" description="Loading...">
        <div className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Edit Collection Package" description="Not found">
        <p className="text-sm text-danger">Collection package not found.</p>
        <PageActions backHref={routes.collectionPackages.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={`Edit ${data.name}`}
      description="Update package metadata and badge style."
    >
      <PageActions backHref={routes.collectionPackages.detail(params.id)} className="mb-6" />
      <CollectionPackageForm
        defaultValues={{
          code: data.code,
          name: data.name,
          description: data.description ?? "",
          badge_tone: data.badge_tone,
          is_active: data.is_active,
        }}
        submitLabel="Save changes"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
