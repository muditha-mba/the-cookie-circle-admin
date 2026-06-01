"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { ProductItemTypeForm } from "@/components/product-item-types/ProductItemTypeForm";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { productItemTypesApi } from "@/lib/api/product-item-types";
import type { ProductItemTypeFormValues } from "@/lib/validation/product";

export default function NewProductItemTypePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: ProductItemTypeFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await productItemTypesApi.create({
        name: values.name,
        description: values.description || null,
        is_active: values.is_active,
      });
      router.push(routes.productItemTypes.detail(created.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to create product item type.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPageShell
      title="Create Item Type"
      description="Add a new product item type category."
    >
      <PageActions backHref={routes.productItemTypes.list} className="mb-6" />
      <ProductItemTypeForm
        submitLabel="Create item type"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
