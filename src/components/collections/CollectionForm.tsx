"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import type { Charge } from "@/lib/api/charge-types";
import type { CollectionPackage } from "@/lib/api/collection-packages";
import { collectionPackagesApi } from "@/lib/api/collection-packages";
import { productCategoriesApi } from "@/lib/api/product-categories";
import { chargeAppliesToCollection } from "@/lib/charge-applicability";
import { labourChargesApi } from "@/lib/api/labour-charges";
import type { ProductItem } from "@/lib/api/product-items";
import { productItemsApi } from "@/lib/api/product-items";
import { isPackagingItemType } from "@/lib/packaging";
import { taxChargesApi } from "@/lib/api/tax-charges";
import { utilityChargesApi } from "@/lib/api/utility-charges";
import {
  collectionSchema,
  type CollectionFormValues,
} from "@/lib/validation/collection-catalog";
import { cn } from "@/lib/utils";

type CollectionFormProps = {
  defaultValues?: Partial<CollectionFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: CollectionFormValues) => Promise<void>;
};

function ChargeMultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: Charge[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((value) => value !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text-primary">{label}</p>
      {options.length === 0 ? (
        <p className="text-xs text-text-muted">No charges available for collections.</p>
      ) : (
        <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border bg-background p-3">
          {options.map((charge) => (
            <label
              key={charge.id}
              className="flex cursor-pointer items-start gap-2 text-sm text-text-primary"
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-border"
                checked={selected.includes(charge.id)}
                onChange={() => toggle(charge.id)}
              />
              <span>
                {charge.name}{" "}
                <span className="text-text-muted">
                  ({charge.charge_type === "fixed" ? "fixed" : `${charge.amount}%`})
                </span>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function CollectionForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: CollectionFormProps) {
  const [packages, setPackages] = useState<CollectionPackage[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [packagingItems, setPackagingItems] = useState<ProductItem[]>([]);
  const [utilityCharges, setUtilityCharges] = useState<Charge[]>([]);
  const [labourCharges, setLabourCharges] = useState<Charge[]>([]);
  const [taxCharges, setTaxCharges] = useState<Charge[]>([]);

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
      utility_charge_ids: [],
      labour_charge_ids: [],
      tax_charge_ids: [],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "item_lines",
  });

  useEffect(() => {
    void Promise.all([
      collectionPackagesApi.list({ page: 1, page_size: 100, sort_by: "name", sort_order: "asc" }),
      productCategoriesApi.list(),
      productItemsApi.list({ page: 1, page_size: 200, sort_by: "name", sort_order: "asc" }),
      utilityChargesApi.list({ page: 1, page_size: 100 }),
      labourChargesApi.list({ page: 1, page_size: 100 }),
      taxChargesApi.list({ page: 1, page_size: 100 }),
    ]).then(([pkgRes, categoryRes, itemsRes, utilityRes, labourRes, taxRes]) => {
      setPackages(pkgRes.items);
      setCategories(categoryRes.map((row) => ({ id: row.id, name: row.name })));
      setPackagingItems(
        itemsRes.items.filter((item) => isPackagingItemType(item.item_type.name)),
      );
      setUtilityCharges(utilityRes.items.filter(chargeAppliesToCollection));
      setLabourCharges(labourRes.items.filter(chargeAppliesToCollection));
      setTaxCharges(taxRes.items.filter(chargeAppliesToCollection));
    });
  }, []);

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

        <FormField label="Package type" htmlFor="package_id" error={form.formState.errors.package_id?.message}>
          <select id="package_id" className={formInputClassName} {...form.register("package_id")}>
            <option value="">Select package</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Package size" htmlFor="package_size" error={form.formState.errors.package_size?.message}>
            <input
              id="package_size"
              type="number"
              min={1}
              className={formInputClassName}
              {...form.register("package_size", { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Package fee (LKR)" htmlFor="package_fee" error={form.formState.errors.package_fee?.message}>
            <input
              id="package_fee"
              type="number"
              min={0}
              step="0.01"
              className={formInputClassName}
              {...form.register("package_fee", { valueAsNumber: true })}
            />
          </FormField>
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
        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_120px_auto] items-end">
            <FormField label="Packaging item" htmlFor={`item_lines.${index}.product_item_id`}>
              <select
                id={`item_lines.${index}.product_item_id`}
                className={formInputClassName}
                {...form.register(`item_lines.${index}.product_item_id`)}
              >
                <option value="">Select item</option>
                {packagingItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
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
        ))}
      </section>

      <section className="rounded-lg border border-border bg-surface p-6 grid gap-6 md:grid-cols-3">
        <Controller
          control={form.control}
          name="utility_charge_ids"
          render={({ field }) => (
            <ChargeMultiSelect
              label="Utility charges"
              options={utilityCharges}
              selected={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={form.control}
          name="labour_charge_ids"
          render={({ field }) => (
            <ChargeMultiSelect
              label="Labour charges"
              options={labourCharges}
              selected={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={form.control}
          name="tax_charge_ids"
          render={({ field }) => (
            <ChargeMultiSelect
              label="Tax charges"
              options={taxCharges}
              selected={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <PrimaryButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : submitLabel}
      </PrimaryButton>
    </form>
  );
}
