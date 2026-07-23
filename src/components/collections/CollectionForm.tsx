"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { PrimaryButton } from "@/components/data/PageActions";
import type { CollectionItemLine } from "@/lib/api/collections";
import type { CollectionPackage } from "@/lib/api/collection-packages";
import { collectionPackagesApi } from "@/lib/api/collection-packages";
import { productCategoriesApi } from "@/lib/api/product-categories";
import type { ProductItem } from "@/lib/api/product-items";
import { productItemsApi } from "@/lib/api/product-items";
import { isPackagingItemType } from "@/lib/packaging";
import {
  collectionSchema,
  type CollectionFormValues,
} from "@/lib/validation/collection-catalog";
import { cn } from "@/lib/utils";

type CollectionFormProps = {
  defaultValues?: Partial<CollectionFormValues>;
  initialItemLines?: CollectionItemLine[];
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: CollectionFormValues) => Promise<void>;
};

export function CollectionForm({
  defaultValues,
  initialItemLines = [],
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: CollectionFormProps) {
  const { canViewFinancials } = useAdminPermissions();
  const [packages, setPackages] = useState<CollectionPackage[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [packagingItems, setPackagingItems] = useState<ProductItem[]>([]);
  const [optionsReady, setOptionsReady] = useState(false);

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: "",
      description: "",
      package_id: "",
      package_size: 6,
      package_fee: 0,
      is_active: true,
      is_public: true,
      allowed_category_ids: [],
      item_lines: [],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "item_lines",
  });

  const itemLines = form.watch("item_lines");

  useEffect(() => {
    void Promise.all([
      collectionPackagesApi.list({ page: 1, page_size: 100, sort_by: "name", sort_order: "asc" }),
      productCategoriesApi.list(),
      productItemsApi.list({ page: 1, page_size: 100, sort_by: "name", sort_order: "asc" }),
    ]).then(([pkgRes, categoryRes, itemsRes]) => {
      setPackages(pkgRes.items);
      setCategories(categoryRes.map((row) => ({ id: row.id, name: row.name })));
      setPackagingItems(
        itemsRes.items.filter((item) => isPackagingItemType(item.item_type.name)),
      );
      setOptionsReady(true);
    });
  }, []);

  const selectedPackagingIds = useMemo(
    () =>
      new Set(
        itemLines
          .map((line) => line.product_item_id)
          .filter((id): id is string => Boolean(id)),
      ),
    [itemLines],
  );

  const savedPackagingIds = useMemo(
    () => new Set(initialItemLines.map((line) => line.product_item_id)),
    [initialItemLines],
  );

  const packagingOptions = useMemo(() => {
    const options = new Map<string, { id: string; label: string }>();

    for (const item of packagingItems) {
      if (item.is_active || selectedPackagingIds.has(item.id) || savedPackagingIds.has(item.id)) {
        options.set(item.id, { id: item.id, label: item.name });
      }
    }

    for (const line of initialItemLines) {
      if (!options.has(line.product_item_id)) {
        options.set(line.product_item_id, {
          id: line.product_item_id,
          label: line.product_item_name,
        });
      }
    }

    return Array.from(options.values()).sort((left, right) =>
      left.label.localeCompare(right.label),
    );
  }, [initialItemLines, packagingItems, savedPackagingIds, selectedPackagingIds]);

  return (
    <form
      className="space-y-8"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <section className="rounded-lg border border-border bg-surface p-6 space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Package configuration</h2>

        <FormField label="Name" htmlFor="name" error={form.formState.errors.name?.message}>
          <input id="name" className={formInputClassName} {...form.register("name")} />
        </FormField>

        <FormField label="Description" htmlFor="description" error={form.formState.errors.description?.message}>
          <textarea
            id="description"
            className={cn(formInputClassName, "min-h-24")}
            {...form.register("description")}
          />
        </FormField>

        <FormField label="Collection type" htmlFor="package_id" error={form.formState.errors.package_id?.message}>
          <Controller
            control={form.control}
            name="package_id"
            render={({ field }) => (
              <select
                key={optionsReady ? "packages-ready" : "packages-loading"}
                id="package_id"
                className={formInputClassName}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                disabled={!optionsReady}
              >
                <option value="">
                  {optionsReady ? "Select collection type" : "Loading collections..."}
                </option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            )}
          />
        </FormField>

        <div className={cn("grid gap-4", canViewFinancials ? "sm:grid-cols-2" : "sm:grid-cols-1")}>
          <FormField label="Package size" htmlFor="package_size" error={form.formState.errors.package_size?.message}>
            <input
              id="package_size"
              type="number"
              min={1}
              className={formInputClassName}
              {...form.register("package_size", { valueAsNumber: true })}
            />
          </FormField>
          {canViewFinancials ? (
            <FormField label="Legacy package fee (LKR)" htmlFor="package_fee" error={form.formState.errors.package_fee?.message}>
              <input
                id="package_fee"
                type="number"
                min={0}
                step="0.01"
                className={formInputClassName}
                {...form.register("package_fee", { valueAsNumber: true })}
              />
            </FormField>
          ) : null}
        </div>

        <Controller
          control={form.control}
          name="allowed_category_ids"
          render={({ field }) => (
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">Allowed categories</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={field.value.includes(category.id)}
                      onChange={() => {
                        if (field.value.includes(category.id)) {
                          field.onChange(field.value.filter((id) => id !== category.id));
                        } else {
                          field.onChange([...field.value, category.id]);
                        }
                      }}
                    />
                    {category.name}
                  </label>
                ))}
              </div>
              {form.formState.errors.allowed_category_ids?.message && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.allowed_category_ids.message}
                </p>
              )}
            </div>
          )}
        />

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("is_active")} />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("is_public")} />
            Public (visible on website)
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Packaging items</h2>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm text-accent"
            onClick={() => append({ product_item_id: "", quantity: 1 })}
          >
            <Plus size={16} />
            Add item
          </button>
        </div>
        {fields.length === 0 ? (
          <p className="text-sm text-text-muted">No packaging items added yet.</p>
        ) : (
          fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_120px_auto] items-end">
              <FormField label="Packaging item" htmlFor={`item_lines.${index}.product_item_id`}>
                <Controller
                  control={form.control}
                  name={`item_lines.${index}.product_item_id`}
                  render={({ field: itemField }) => (
                    <select
                      key={`${field.id}-${optionsReady ? "ready" : "loading"}`}
                      id={`item_lines.${index}.product_item_id`}
                      className={formInputClassName}
                      value={itemField.value ?? ""}
                      onChange={itemField.onChange}
                      onBlur={itemField.onBlur}
                      ref={itemField.ref}
                      disabled={!optionsReady}
                    >
                      <option value="">
                        {optionsReady ? "Select item" : "Loading items..."}
                      </option>
                      {packagingOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </FormField>
              <FormField label="Qty" htmlFor={`item_lines.${index}.quantity`}>
                <input
                  id={`item_lines.${index}.quantity`}
                  type="number"
                  min={0.0001}
                  step="any"
                  className={formInputClassName}
                  {...form.register(`item_lines.${index}.quantity`, { valueAsNumber: true })}
                />
              </FormField>
              <button
                type="button"
                className="mb-2 rounded-md border border-border p-2 text-text-muted hover:text-red-600"
                onClick={() => remove(index)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <PrimaryButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : submitLabel}
      </PrimaryButton>
    </form>
  );
}
