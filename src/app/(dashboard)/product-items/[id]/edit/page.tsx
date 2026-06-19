"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { ProductItemForm } from "@/components/product-items/ProductItemForm";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { productItemTypesApi } from "@/lib/api/product-item-types";
import { productItemsApi } from "@/lib/api/product-items";
import { suppliersApi } from "@/lib/api/suppliers";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { ProductItemFormValues } from "@/lib/validation/product";

export default function EditProductItemPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product-item", params.id],
    queryFn: () => productItemsApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const { data: typesData, isLoading: typesLoading } = useQuery({
    queryKey: ["product-item-types", "all"],
    queryFn: () =>
      productItemTypesApi.list({ page: 1, page_size: 100, sort_by: "name", sort_order: "asc" }),
  });

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers", "active"],
    queryFn: () => suppliersApi.listActive(),
  });

  const handleSubmit = async (values: ProductItemFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await productItemsApi.update(params.id, {
        item_type_id: values.item_type_id,
        name: values.name,
        description: values.description || null,
        purchase_price: values.purchase_price,
        purchase_quantity: values.purchase_quantity,
        purchase_unit: values.purchase_unit,
        primary_supplier_id: values.primary_supplier_id || null,
        is_active: values.is_active,
        track_inventory: values.track_inventory,
        reorder_level: values.reorder_level ?? null,
        reorder_unit: values.reorder_unit || null,
      });
      cacheEntitySave(
        queryClient,
        ["product-item", params.id],
        ["product-items"],
        updated,
        { alsoInvalidate: [["products"], ["collections"]] },
      );
      router.push(routes.productItems.detail(params.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to update product item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || typesLoading || suppliersLoading) {
    return (
      <DashboardPageShell title="Edit Product Item" description="Loading...">
        <div className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data || !typesData) {
    return (
      <DashboardPageShell title="Edit Product Item" description="Not found">
        <p className="text-sm text-danger">Product item not found.</p>
        <PageActions backHref={routes.productItems.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={`Edit ${data.name}`}
      description="Update product item details and costing."
    >
      <PageActions backHref={routes.productItems.detail(params.id)} className="mb-6" />
      <ProductItemForm
        itemTypes={typesData.items}
        suppliers={suppliers}
        defaultValues={{
          item_type_id: data.item_type_id,
          name: data.name,
          description: data.description ?? "",
          purchase_price: Number(data.purchase_price),
          purchase_quantity: Number(data.purchase_quantity),
          purchase_unit: data.purchase_unit,
          primary_supplier_id: data.primary_supplier_id ?? "",
          is_active: data.is_active,
          track_inventory: data.track_inventory,
          reorder_level: data.reorder_level ? Number(data.reorder_level) : null,
          reorder_unit: data.reorder_unit ?? "",
        }}
        submitLabel="Save changes"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
