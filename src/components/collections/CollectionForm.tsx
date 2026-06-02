"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { CollectionCostBreakdownView } from "@/components/collections/CollectionCostBreakdownView";
import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Charge } from "@/lib/api/charge-types";
import type { CollectionPackage } from "@/lib/api/collection-packages";
import type { CollectionCostBreakdown } from "@/lib/api/collections";
import { collectionsApi } from "@/lib/api/collections";
import { collectionPackagesApi } from "@/lib/api/collection-packages";
import { chargeAppliesToCollection } from "@/lib/charge-applicability";
import { labourChargesApi } from "@/lib/api/labour-charges";
import type { ProductItem } from "@/lib/api/product-items";
import { productItemsApi } from "@/lib/api/product-items";
import type { ProductSummary } from "@/lib/api/products";
import { productsApi } from "@/lib/api/products";
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
  const [catalogProducts, setCatalogProducts] = useState<ProductSummary[]>([]);
  const [packagingItems, setPackagingItems] = useState<ProductItem[]>([]);
  const [utilityCharges, setUtilityCharges] = useState<Charge[]>([]);
  const [labourCharges, setLabourCharges] = useState<Charge[]>([]);
  const [taxCharges, setTaxCharges] = useState<Charge[]>([]);
  const [collectionPackages, setCollectionPackages] = useState<CollectionPackage[]>([]);
  const [preview, setPreview] = useState<CollectionCostBreakdown | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: "",
      description: "",
      selling_price: 0,
      buffer_amount: 0,
      package_id: "",
      is_active: true,
      is_public: true,
      product_lines: [],
      item_lines: [],
      utility_charge_ids: [],
      labour_charge_ids: [],
      tax_charge_ids: [],
      ...defaultValues,
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "product_lines",
  });
  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: "item_lines",
  });

  const sellingPrice = watch("selling_price");
  const bufferAmount = watch("buffer_amount");
  const productLines = watch("product_lines");
  const itemLines = watch("item_lines");
  const utilityChargeIds = watch("utility_charge_ids");
  const labourChargeIds = watch("labour_charge_ids");
  const taxChargeIds = watch("tax_charge_ids");

  const previewPayloadKey = JSON.stringify({
    selling_price: sellingPrice,
    buffer_amount: bufferAmount,
    product_lines: productLines,
    item_lines: itemLines,
    utility_charge_ids: utilityChargeIds,
    labour_charge_ids: labourChargeIds,
    tax_charge_ids: taxChargeIds,
  });
  const debouncedPreviewKey = useDebouncedValue(previewPayloadKey, 400);
  const previewRequestId = useRef(0);

  useEffect(() => {
    void (async () => {
      const [products, productItems, utilities, labour, tax, packages] = await Promise.all([
        productsApi.list({ page: 1, page_size: 100, sort_by: "name", sort_order: "asc" }),
        productItemsApi.list({ page: 1, page_size: 100, sort_by: "name", sort_order: "asc" }),
        utilityChargesApi.list({ page: 1, page_size: 100, sort_by: "name", sort_order: "asc" }),
        labourChargesApi.list({ page: 1, page_size: 100, sort_by: "name", sort_order: "asc" }),
        taxChargesApi.list({ page: 1, page_size: 100, sort_by: "name", sort_order: "asc" }),
        collectionPackagesApi.list({
          page: 1,
          page_size: 100,
          sort_by: "name",
          sort_order: "asc",
        }),
      ]);
      setCatalogProducts(products.items.filter((p) => p.is_active));
      setPackagingItems(
        productItems.items.filter(
          (item) => item.is_active && isPackagingItemType(item.item_type.name),
        ),
      );
      setUtilityCharges(utilities.items.filter(chargeAppliesToCollection));
      setLabourCharges(labour.items.filter(chargeAppliesToCollection));
      setTaxCharges(tax.items.filter(chargeAppliesToCollection));
      setCollectionPackages(packages.items);
      if (!form.getValues("package_id") && packages.items.length > 0) {
        const defaultPackage = packages.items.find((pkg) => pkg.is_active) ?? packages.items[0];
        form.setValue("package_id", defaultPackage.id, { shouldValidate: true });
      }
    })();
  }, [form]);

  const productsReady = catalogProducts.length > 0;
  const packagingReady = packagingItems.length > 0;

  useEffect(() => {
    const input = JSON.parse(debouncedPreviewKey) as Pick<
      CollectionFormValues,
      | "selling_price"
      | "buffer_amount"
      | "product_lines"
      | "item_lines"
      | "utility_charge_ids"
      | "labour_charge_ids"
      | "tax_charge_ids"
    >;

    const hasProducts = input.product_lines.some(
      (line) => line.product_id && line.quantity > 0,
    );
    const hasItems = input.item_lines.some(
      (line) => line.product_item_id && line.quantity > 0,
    );
    if (!hasProducts && !hasItems && input.selling_price <= 0) {
      setPreview(null);
      setPreviewError(null);
      setIsPreviewLoading(false);
      return;
    }

    const requestId = ++previewRequestId.current;

    void (async () => {
      setIsPreviewLoading(true);
      setPreviewError(null);
      try {
        const result = await collectionsApi.previewCost({
          selling_price: input.selling_price,
          buffer_amount: input.buffer_amount,
          product_lines: input.product_lines.filter((line) => line.product_id),
          item_lines: input.item_lines.filter((line) => line.product_item_id),
          utility_charge_ids: input.utility_charge_ids,
          labour_charge_ids: input.labour_charge_ids,
          tax_charge_ids: input.tax_charge_ids,
        });
        if (requestId !== previewRequestId.current) {
          return;
        }
        setPreview(result);
      } catch {
        if (requestId !== previewRequestId.current) {
          return;
        }
        setPreview(null);
        setPreviewError("Unable to calculate cost preview.");
      } finally {
        if (requestId === previewRequestId.current) {
          setIsPreviewLoading(false);
        }
      }
    })();
  }, [debouncedPreviewKey]);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-lg border border-border bg-surface p-6"
        noValidate
      >
        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <input id="name" className={formInputClassName} {...register("name")} />
        </FormField>

        <FormField
          label="Description"
          htmlFor="description"
          error={errors.description?.message}
        >
          <textarea
            id="description"
            rows={3}
            className={formInputClassName}
            {...register("description")}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            label="Selling price (LKR)"
            htmlFor="selling_price"
            error={errors.selling_price?.message}
          >
            <input
              id="selling_price"
              type="number"
              min={0}
              step="0.01"
              className={formInputClassName}
              {...register("selling_price", { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label="Buffer amount (LKR)"
            htmlFor="buffer_amount"
            error={errors.buffer_amount?.message}
            hint="Optional extra cost for this collection"
          >
            <input
              id="buffer_amount"
              type="number"
              min={0}
              step="0.01"
              className={formInputClassName}
              {...register("buffer_amount", { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label="Package"
            htmlFor="package_id"
            error={errors.package_id?.message}
          >
            <select
              id="package_id"
              className={formInputClassName}
              {...register("package_id")}
            >
              <option value="">Select package</option>
              {collectionPackages.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}{option.is_active ? "" : " (inactive)"}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="flex flex-wrap gap-6">
          <FormField label="Status" htmlFor="is_active">
            <label className="flex items-center gap-2 text-sm text-text-primary">
              <input
                id="is_active"
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                {...register("is_active")}
              />
              Active (operational)
            </label>
          </FormField>
          <FormField label="Visibility" htmlFor="is_public">
            <label className="flex items-center gap-2 text-sm text-text-primary">
              <input
                id="is_public"
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                {...register("is_public")}
              />
              Public (customer-facing)
            </label>
          </FormField>
        </div>

        <div className="space-y-3 border-t border-border pt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Products</h3>
              <p className="text-xs text-text-muted">Products included in this bundle</p>
            </div>
            <button
              type="button"
              onClick={() => append({ product_id: "", quantity: 1 })}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-hover"
            >
              <Plus className="h-3.5 w-3.5" />
              Add product
            </button>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-text-muted">No products yet.</p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-[1fr_140px_auto]"
                >
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Product</label>
                    <Controller
                      control={control}
                      name={`product_lines.${index}.product_id`}
                      render={({ field: productField }) => (
                        <select
                          key={`${field.id}-${productsReady ? "ready" : "loading"}`}
                          className={formInputClassName}
                          value={productField.value ?? ""}
                          onChange={productField.onChange}
                          onBlur={productField.onBlur}
                          ref={productField.ref}
                        >
                          <option value="">Select product</option>
                          {catalogProducts.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Quantity</label>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      className={formInputClassName}
                      {...register(`product_lines.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-md border border-border text-danger hover:bg-danger/10"
                      aria-label="Remove product line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-border pt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Packaging & collection items
              </h3>
              <p className="text-xs text-text-muted">
                Packaging materials such as boxes, ribbons, and labels
              </p>
            </div>
            <button
              type="button"
              onClick={() => appendItem({ product_item_id: "", quantity: 1 })}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-hover"
            >
              <Plus className="h-3.5 w-3.5" />
              Add item
            </button>
          </div>

          {itemFields.length === 0 ? (
            <p className="text-sm text-text-muted">No packaging items yet.</p>
          ) : (
            <div className="space-y-3">
              {itemFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-[1fr_140px_auto]"
                >
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Product item</label>
                    <Controller
                      control={control}
                      name={`item_lines.${index}.product_item_id`}
                      render={({ field: itemField }) => (
                        <select
                          key={`${field.id}-${packagingReady ? "ready" : "loading"}`}
                          className={formInputClassName}
                          value={itemField.value ?? ""}
                          onChange={itemField.onChange}
                          onBlur={itemField.onBlur}
                          ref={itemField.ref}
                        >
                          <option value="">Select packaging item</option>
                          {packagingItems.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Quantity</label>
                    <input
                      type="number"
                      min={0}
                      step="0.0001"
                      className={formInputClassName}
                      {...register(`item_lines.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-md border border-border text-danger hover:bg-danger/10"
                      aria-label="Remove packaging item line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Collection charges</h3>
            <p className="text-xs text-text-muted">
              Only charges marked for collections or both
            </p>
          </div>
          <ChargeMultiSelect
            label="Utility charges"
            options={utilityCharges}
            selected={utilityChargeIds}
            onChange={(ids) => form.setValue("utility_charge_ids", ids)}
          />
          <ChargeMultiSelect
            label="Labour charges"
            options={labourCharges}
            selected={labourChargeIds}
            onChange={(ids) => form.setValue("labour_charge_ids", ids)}
          />
          <ChargeMultiSelect
            label="Tax charges"
            options={taxCharges}
            selected={taxChargeIds}
            onChange={(ids) => form.setValue("tax_charge_ids", ids)}
          />
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <PrimaryButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </PrimaryButton>
      </form>

      <aside className="space-y-3 xl:sticky xl:top-6 xl:self-start">
        <div className="rounded-lg border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold text-text-primary">Live cost preview</h3>
          <p className="mt-1 text-xs text-text-muted">
            Updates as you edit products, packaging items, charges, and pricing
          </p>
        </div>
        {isPreviewLoading ? (
          <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
        ) : previewError ? (
          <p className="text-sm text-danger">{previewError}</p>
        ) : preview ? (
          <CollectionCostBreakdownView breakdown={preview} />
        ) : (
          <p className={cn("text-sm text-text-muted")}>
            Add products, packaging items, or pricing to see a cost preview.
          </p>
        )}
      </aside>
    </div>
  );
}
