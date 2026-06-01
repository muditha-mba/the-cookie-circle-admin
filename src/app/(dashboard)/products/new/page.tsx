"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { ProductForm } from "@/components/products/ProductForm";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { productsApi } from "@/lib/api/products";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { ProductFormValues } from "@/lib/validation/product-catalog";

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: ProductFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await productsApi.create({
        name: values.name,
        description: values.description || null,
        selling_price: values.selling_price,
        buffer_amount: values.buffer_amount,
        yield_quantity: values.yield_quantity,
        production_notes: values.production_notes || null,
        is_active: values.is_active,
        recipe_lines: values.recipe_lines,
        utility_charge_ids: values.utility_charge_ids,
        labour_charge_ids: values.labour_charge_ids,
        tax_charge_ids: values.tax_charge_ids,
      });
      cacheEntitySave(queryClient, ["products", created.id], ["products"], created);
      router.push(routes.products.detail(created.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPageShell
      title="Create Product"
      description="Build a product recipe and review live costing."
    >
      <PageActions backHref={routes.products.list} className="mb-6" />
      <ProductForm
        submitLabel="Create product"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
