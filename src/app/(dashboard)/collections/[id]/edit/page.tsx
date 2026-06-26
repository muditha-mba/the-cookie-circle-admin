"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { CollectionForm } from "@/components/collections/CollectionForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import { collectionsApi } from "@/lib/api/collections";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { CollectionFormValues } from "@/lib/validation/collection-catalog";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

export default function EditCollectionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["collections", params.id],
    queryFn: () => collectionsApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleSubmit = async (values: CollectionFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await collectionsApi.update(params.id, {
        name: values.name,
        description: values.description || null,
        package_id: values.package_id,
        package_size: values.package_size,
        package_fee: values.package_fee,
        is_active: values.is_active,
        is_public: values.is_public,
        allowed_category_ids: values.allowed_category_ids,
        item_lines: values.item_lines,
      });
      cacheEntitySave(queryClient, ["collections", params.id], ["collections"], updated);
      notifyActionSuccess("Changes saved successfully.");
      router.push(routes.collections.detail(params.id));
    } catch (err) {
      notifyActionError(err, "Unable to update collection.", setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Edit Collection" description="Loading...">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Edit Collection" description="Not found">
        <p className="text-sm text-danger">Collection not found.</p>
        <PageActions backHref={routes.collections.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={`Edit ${data.name}`}
      description="Update package configuration."
    >
      <PageActions backHref={routes.collections.detail(params.id)} className="mb-6" />
      <CollectionForm
        defaultValues={{
          name: data.name,
          description: data.description ?? "",
          package_id: data.package_id,
          package_size: data.package_size,
          package_fee: Number(data.package_fee),
          is_active: data.is_active,
          is_public: data.is_public,
          allowed_category_ids: data.allowed_category_ids,
          item_lines: data.item_lines.map((line) => ({
            product_item_id: line.product_item_id,
            quantity: Number(line.quantity),
          })),
        }}
        submitLabel="Save changes"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
