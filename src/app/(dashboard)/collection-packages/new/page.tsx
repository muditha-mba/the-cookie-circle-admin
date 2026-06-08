"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CollectionPackageForm } from "@/components/collection-packages/CollectionPackageForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import { collectionPackagesApi } from "@/lib/api/collection-packages";
import type { ApiError } from "@/lib/api/types";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { CollectionPackageFormValues } from "@/lib/validation/collection-package";

export default function NewCollectionPackagePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: CollectionPackageFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await collectionPackagesApi.create({
        code: values.code,
        name: values.name,
        description: values.description || null,
        badge_tone: values.badge_tone,
        is_active: values.is_active,
      });
      cacheEntitySave(
        queryClient,
        ["collection-package", created.id],
        ["collection-packages"],
        created,
        { alsoInvalidate: [["collections"]] },
      );
      router.push(routes.collectionPackages.detail(created.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to create collection package.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPageShell
      title="Create Collection Package"
      description="Add a new package category for collections."
    >
      <PageActions backHref={routes.collectionPackages.list} className="mb-6" />
      <CollectionPackageForm
        submitLabel="Create package"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
