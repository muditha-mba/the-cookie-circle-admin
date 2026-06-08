"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { ProductCostBreakdownView } from "@/components/products/ProductCostBreakdownView";
import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Charge } from "@/lib/api/charge-types";
import { labourChargesApi } from "@/lib/api/labour-charges";
import { productItemsApi } from "@/lib/api/product-items";
import type { ProductItem } from "@/lib/api/product-items";
import type { ProductCostBreakdown } from "@/lib/api/products";
import { productCategoriesApi } from "@/lib/api/product-categories";
import { productsApi } from "@/lib/api/products";
import { chargeAppliesToProduct } from "@/lib/charge-applicability";
import { taxChargesApi } from "@/lib/api/tax-charges";
import { utilityChargesApi } from "@/lib/api/utility-charges";
import {
  productSchema,
  type ProductFormValues,
} from "@/lib/validation/product-catalog";
import { cn } from "@/lib/utils";

type ProductFormProps = {
  defaultValues?: Partial<ProductFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: ProductFormValues) => Promise<void>;
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
        <p className="text-xs text-text-muted">No charges available.</p>
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

export function ProductForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: ProductFormProps) {
  const [productItems, setProductItems] = useState<ProductItem[]>([]);
  const [utilityCharges, setUtilityCharges] = useState<Charge[]>([]);
  const [labourCharges, setLabourCharges] = useState<Charge[]>([]);
  const [taxCharges, setTaxCharges] = useState<Charge[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [preview, setPreview] = useState<ProductCostBreakdown | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      selling_price: 0,
      buffer_amount: 0,
      yield_quantity: 1,
      production_notes: "",
      is_active: true,
      is_public: true,
      recipe_lines: [],
      utility_charge_ids: [],
      labour_charge_ids: [],
      tax_charge_ids: [],
      ...defaultValues,
    },
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipe_lines",
  });

  const sellingPrice = watch("selling_price");
  const bufferAmount = watch("buffer_amount");
  const yieldQuantity = watch("yield_quantity");
  const productionNotes = watch("production_notes");
  const recipeLines = watch("recipe_lines");
  const utilityChargeIds = watch("utility_charge_ids");
  const labourChargeIds = watch("labour_charge_ids");
  const taxChargeIds = watch("tax_charge_ids");

  const previewPayloadKey = JSON.stringify({
    selling_price: sellingPrice,
    buffer_amount: bufferAmount,
    yield_quantity: yieldQuantity,
    recipe_lines: recipeLines,
    utility_charge_ids: utilityChargeIds,
    labour_charge_ids: labourChargeIds,
    tax_charge_ids: taxChargeIds,
  });
  const debouncedPreviewKey = useDebouncedValue(previewPayloadKey, 400);
  const previewRequestId = useRef(0);

  useEffect(() => {
    void (async () => {
      const [items, categoryRows, utilities, labour, tax] = await Promise.all([
        productItemsApi.list({ page: 1, page_size: 100, sort_by: "name", sort_order: "asc" }),
        productCategoriesApi.list(),
        utilityChargesApi.list({ page: 1, page_size: 100, sort_by: "name", sort_order: "asc" }),
        labourChargesApi.list({ page: 1, page_size: 100, sort_by: "name", sort_order: "asc" }),
        taxChargesApi.list({ page: 1, page_size: 100, sort_by: "name", sort_order: "asc" }),
      ]);
      setProductItems(items.items);
      setCategories(categoryRows.map((row) => ({ id: row.id, name: row.name })));
      setUtilityCharges(utilities.items.filter(chargeAppliesToProduct));
      setLabourCharges(labour.items.filter(chargeAppliesToProduct));
      setTaxCharges(tax.items.filter(chargeAppliesToProduct));
    })();
  }, []);

  const recipeItemIds = useMemo(
    () =>
      new Set(
        recipeLines
          .map((line) => line.product_item_id)
          .filter((id): id is string => Boolean(id)),
      ),
    [recipeLines],
  );

  const itemOptions = useMemo(
    () =>
      productItems.filter(
        (item) => item.is_active || recipeItemIds.has(item.id),
      ),
    [productItems, recipeItemIds],
  );

  const productItemsReady = productItems.length > 0;

  useEffect(() => {
    const input = JSON.parse(debouncedPreviewKey) as Pick<
      ProductFormValues,
      | "selling_price"
      | "buffer_amount"
      | "yield_quantity"
      | "recipe_lines"
      | "utility_charge_ids"
      | "labour_charge_ids"
      | "tax_charge_ids"
    >;

    const hasRecipe = input.recipe_lines.some(
      (line) => line.product_item_id && line.quantity > 0,
    );
    if ((!hasRecipe && input.selling_price <= 0) || input.yield_quantity <= 0) {
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
        const result = await productsApi.previewCost({
          selling_price: input.selling_price,
          buffer_amount: input.buffer_amount,
          yield_quantity: input.yield_quantity,
          recipe_lines: input.recipe_lines.filter((line) => line.product_item_id),
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

        <FormField label="Category" htmlFor="category_id" error={errors.category_id?.message}>
          <select id="category_id" className={formInputClassName} {...register("category_id")}>
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
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
            hint="Optional extra cost for unforeseen production expenses"
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

        <div className="space-y-4 border-t border-border pt-6">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Production</h3>
            <p className="text-xs text-text-muted">
              Internal batch yield and preparation notes (not customer-facing)
            </p>
          </div>
          <FormField
            label="Yield quantity"
            htmlFor="yield_quantity"
            error={errors.yield_quantity?.message}
            hint="Number of units produced from this recipe batch"
          >
            <input
              id="yield_quantity"
              type="number"
              min={0.0001}
              step="0.0001"
              className={formInputClassName}
              {...register("yield_quantity", { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label="Production notes"
            htmlFor="production_notes"
            error={errors.production_notes?.message}
            hint="Optional internal instructions for production"
          >
            <textarea
              id="production_notes"
              rows={4}
              className={formInputClassName}
              {...register("production_notes")}
            />
          </FormField>
        </div>

        <div className="space-y-3 border-t border-border pt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Recipe</h3>
              <p className="text-xs text-text-muted">Product items and quantities used</p>
            </div>
            <button
              type="button"
              onClick={() => append({ product_item_id: "", quantity: 1 })}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-hover"
            >
              <Plus className="h-3.5 w-3.5" />
              Add line
            </button>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-text-muted">No recipe lines yet.</p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-[1fr_140px_auto]"
                >
                  <div>
                    <label className="mb-1 block text-xs text-text-muted">Product item</label>
                    <Controller
                      control={control}
                      name={`recipe_lines.${index}.product_item_id`}
                      render={({ field: itemField }) => (
                        <select
                          key={`${field.id}-${productItemsReady ? "ready" : "loading"}`}
                          id={`recipe_lines.${index}.product_item_id`}
                          className={formInputClassName}
                          value={itemField.value ?? ""}
                          onChange={itemField.onChange}
                          onBlur={itemField.onBlur}
                          ref={itemField.ref}
                        >
                          <option value="">Select item</option>
                          {itemOptions.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} ({item.purchase_unit})
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
                      {...register(`recipe_lines.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-md border border-border text-danger hover:bg-danger/10"
                      aria-label="Remove recipe line"
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
            <h3 className="text-sm font-semibold text-text-primary">Attached charges</h3>
            <p className="text-xs text-text-muted">
              References global charges — amounts are not duplicated
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
            Updates as you edit recipe, charges, and pricing
          </p>
        </div>
        {isPreviewLoading ? (
          <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
        ) : previewError ? (
          <p className="text-sm text-danger">{previewError}</p>
        ) : preview ? (
          <ProductCostBreakdownView
            breakdown={preview}
            yieldQuantity={yieldQuantity}
            productionNotes={productionNotes}
          />
        ) : (
          <p className={cn("text-sm text-text-muted")}>
            Add recipe lines or pricing to see a cost preview.
          </p>
        )}
      </aside>
    </div>
  );
}
