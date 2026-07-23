"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CollectionPackageForm } from "@/components/collection-packages/CollectionPackageForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import { collectionPackagesApi } from "@/lib/api/collection-packages";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { CollectionPackageFormValues } from "@/lib/validation/collection-package";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

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
        min_quantity: values.min_quantity,
        max_quantity: values.max_quantity,
        packaging_fee_mode: values.packaging_fee_mode,
        packaging_fee_amount: values.packaging_fee_amount,
      });
      cacheEntitySave(
        queryClient,
        ["collection-package", created.id],
        ["collection-packages"],
        created,
        { alsoInvalidate: [["collections"]] },
      );
      notifyActionSuccess("Collection created successfully.");
      router.push(routes.collectionPackages.detail(created.id));
    } catch (err) {
      notifyActionError(err, "Unable to create collection.", setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPageShell
      title="Create Collection"
      description="Add a collection type customers can order (Butter, Mix, Special)."
    >
      <PageActions backHref={routes.collectionPackages.list} className="mb-6" />
      <CollectionPackageForm
        submitLabel="Create collection"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
