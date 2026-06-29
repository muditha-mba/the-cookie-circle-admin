"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { ProductItemForm } from "@/components/product-items/ProductItemForm";
import { routes } from "@/config/routes";
import { productItemTypesApi } from "@/lib/api/product-item-types";
import { productItemsApi } from "@/lib/api/product-items";
import { suppliersApi } from "@/lib/api/suppliers";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { ProductItemFormValues } from "@/lib/validation/product";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

export default function NewProductItemPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const created = await productItemsApi.create({
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
        ["product-item", created.id],
        ["product-items"],
        created,
        { alsoInvalidate: [["products"], ["collections"]] },
      );
      notifyActionSuccess("Product item created successfully.");
      router.push(routes.productItems.detail(created.id));
    } catch (err) {
      notifyActionError(err, "Unable to create product item.", setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPageShell
      title="Create Product Item"
      description="Add a purchased resource with unit cost."
    >
      <PageActions backHref={routes.productItems.list} className="mb-6" />

      {typesLoading || suppliersLoading ? (
        <div className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      ) : typesData && typesData.items.length > 0 ? (
        <ProductItemForm
          itemTypes={typesData.items}
          suppliers={suppliers}
          submitLabel="Create product item"
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
        />
      ) : (
        <p className="text-sm text-text-secondary">
          Create at least one product item type before adding product items.
        </p>
      )}
    </DashboardPageShell>
  );
}
