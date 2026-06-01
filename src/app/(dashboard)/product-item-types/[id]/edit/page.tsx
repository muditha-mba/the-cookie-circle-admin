"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { ProductItemTypeForm } from "@/components/product-item-types/ProductItemTypeForm";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { productItemTypesApi } from "@/lib/api/product-item-types";
import type { ProductItemTypeFormValues } from "@/lib/validation/product";

export default function EditProductItemTypePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product-item-type", params.id],
    queryFn: () => productItemTypesApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleSubmit = async (values: ProductItemTypeFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await productItemTypesApi.update(params.id, {
        name: values.name,
        description: values.description || null,
        is_active: values.is_active,
      });
      router.push(routes.productItemTypes.detail(params.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to update product item type.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Edit Item Type" description="Loading...">
        <div className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Edit Item Type" description="Not found">
        <p className="text-sm text-danger">Product item type not found.</p>
        <PageActions backHref={routes.productItemTypes.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={`Edit ${data.name}`}
      description="Update product item type details."
    >
      <PageActions
        backHref={routes.productItemTypes.detail(params.id)}
        className="mb-6"
      />
      <ProductItemTypeForm
        defaultValues={{
          name: data.name,
          description: data.description ?? "",
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
