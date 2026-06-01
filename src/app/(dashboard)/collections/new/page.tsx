"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CollectionForm } from "@/components/collections/CollectionForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { collectionsApi } from "@/lib/api/collections";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { CollectionFormValues } from "@/lib/validation/collection-catalog";

export default function NewCollectionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: CollectionFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await collectionsApi.create({
        name: values.name,
        description: values.description || null,
        selling_price: values.selling_price,
        buffer_amount: values.buffer_amount,
        is_active: values.is_active,
        is_public: values.is_public,
        product_lines: values.product_lines,
        item_lines: values.item_lines,
        utility_charge_ids: values.utility_charge_ids,
        labour_charge_ids: values.labour_charge_ids,
        tax_charge_ids: values.tax_charge_ids,
      });
      cacheEntitySave(queryClient, ["collections", created.id], ["collections"], created);
      router.push(routes.collections.detail(created.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to create collection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPageShell
      title="Create Collection"
      description="Build a product bundle and review live costing."
    >
      <PageActions backHref={routes.collections.list} className="mb-6" />
      <CollectionForm
        submitLabel="Create collection"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
