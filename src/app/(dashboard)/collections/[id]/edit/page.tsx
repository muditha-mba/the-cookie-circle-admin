"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { CollectionForm } from "@/components/collections/CollectionForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { collectionsApi } from "@/lib/api/collections";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { CollectionFormValues } from "@/lib/validation/collection-catalog";

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
        selling_price: values.selling_price,
        buffer_amount: values.buffer_amount,
        is_active: values.is_active,
        product_lines: values.product_lines,
        item_lines: values.item_lines,
        utility_charge_ids: values.utility_charge_ids,
        labour_charge_ids: values.labour_charge_ids,
        tax_charge_ids: values.tax_charge_ids,
      });
      cacheEntitySave(queryClient, ["collections", params.id], ["collections"], updated);
      router.push(routes.collections.detail(params.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to update collection.");
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
      description="Update products, charges, and pricing."
    >
      <PageActions backHref={routes.collections.detail(params.id)} className="mb-6" />
      <CollectionForm
        defaultValues={{
          name: data.name,
          description: data.description ?? "",
          selling_price: Number(data.selling_price),
          buffer_amount: Number(data.buffer_amount),
          is_active: data.is_active,
          product_lines: data.product_lines.map((line) => ({
            product_id: line.product_id,
            quantity: Number(line.quantity),
          })),
          item_lines: data.item_lines.map((line) => ({
            product_item_id: line.product_item_id,
            quantity: Number(line.quantity),
          })),
          utility_charge_ids: data.utility_charges.map((c) => c.id),
          labour_charge_ids: data.labour_charges.map((c) => c.id),
          tax_charge_ids: data.tax_charges.map((c) => c.id),
        }}
        submitLabel="Save changes"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
