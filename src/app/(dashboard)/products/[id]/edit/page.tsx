"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { ProductForm } from "@/components/products/ProductForm";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { productsApi } from "@/lib/api/products";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { ProductFormValues } from "@/lib/validation/product-catalog";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", params.id],
    queryFn: () => productsApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleSubmit = async (values: ProductFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await productsApi.update(params.id, {
        name: values.name,
        description: values.description || null,
        category_id: values.category_id,
        selling_price: values.selling_price,
        buffer_amount: values.buffer_amount,
        yield_quantity: values.yield_quantity,
        production_notes: values.production_notes || null,
        is_active: values.is_active,
        is_public: values.is_public,
        recipe_lines: values.recipe_lines,
      });
      cacheEntitySave(queryClient, ["products", params.id], ["products"], updated, {
        alsoInvalidate: [["collections"]],
      });
      router.push(routes.products.detail(params.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to update product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Edit Product" description="Loading...">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Edit Product" description="Not found">
        <p className="text-sm text-danger">Product not found.</p>
        <PageActions backHref={routes.products.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={`Edit ${data.name}`}
      description="Update recipe and pricing."
    >
      <PageActions backHref={routes.products.detail(params.id)} className="mb-6" />
      <ProductForm
        defaultValues={{
          name: data.name,
          description: data.description ?? "",
          category_id: data.category_id,
          selling_price: Number(data.selling_price),
          buffer_amount: Number(data.buffer_amount),
          yield_quantity: Number(data.yield_quantity),
          production_notes: data.production_notes ?? "",
          is_active: data.is_active,
          is_public: data.is_public,
          recipe_lines: data.recipe_lines.map((line) => ({
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
