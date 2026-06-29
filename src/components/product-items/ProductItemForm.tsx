"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { UnitSelect } from "@/components/forms/UnitSelect";
import { PrimaryButton } from "@/components/data/PageActions";
import { DEFAULT_UNIT, normalizeReorderUnitForForm } from "@/lib/units";
import type { ProductItemType } from "@/lib/api/product-item-types";
import type { Supplier } from "@/lib/api/suppliers";
import {
  productItemSchema,
  type ProductItemFormValues,
} from "@/lib/validation/product";

type ProductItemFormProps = {
  itemTypes: ProductItemType[];
  suppliers: Supplier[];
  defaultValues?: Partial<ProductItemFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: ProductItemFormValues) => Promise<void>;
};

export function ProductItemForm({
  itemTypes,
  suppliers,
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: ProductItemFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductItemFormValues>({
    resolver: zodResolver(productItemSchema),
    defaultValues: useMemo(() => {
      const base: ProductItemFormValues = {
        item_type_id: "",
        name: "",
        description: "",
        purchase_price: 0,
        purchase_quantity: 1,
        purchase_unit: DEFAULT_UNIT,
        primary_supplier_id: "",
        is_active: true,
        track_inventory: false,
        reorder_level: null,
        reorder_unit: "",
        ...defaultValues,
      };

      return {
        ...base,
        reorder_unit: normalizeReorderUnitForForm(base.reorder_unit, base.purchase_unit),
      };
    }, [defaultValues]),
  });

  const purchasePrice = watch("purchase_price");
  const purchaseQuantity = watch("purchase_quantity");
  const purchaseUnit = watch("purchase_unit");
  const reorderUnit = watch("reorder_unit");
  const previewCost =
    purchaseQuantity > 0
      ? (Number(purchasePrice) / Number(purchaseQuantity)).toFixed(4)
      : "—";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl space-y-6 rounded-lg border border-border bg-surface p-6"
      noValidate
    >
      <FormField
        label="Item type"
        htmlFor="item_type_id"
        error={errors.item_type_id?.message}
      >
        <select id="item_type_id" className={formInputClassName} {...register("item_type_id")}>
          <option value="">Select a type</option>
          {itemTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <input id="name" className={formInputClassName} {...register("name")} />
      </FormField>

      <FormField
        label="Primary supplier"
        htmlFor="primary_supplier_id"
        error={errors.primary_supplier_id?.message}
        hint="Used for purchase planning. Optional."
      >
        <select
          id="primary_supplier_id"
          className={formInputClassName}
          {...register("primary_supplier_id")}
        >
          <option value="">No supplier assigned</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.supplier_name}
            </option>
          ))}
        </select>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Purchase price (LKR)"
          htmlFor="purchase_price"
          error={errors.purchase_price?.message}
        >
          <input
            id="purchase_price"
            type="number"
            min={0}
            step="0.01"
            className={formInputClassName}
            {...register("purchase_price", { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          label="Purchase quantity"
          htmlFor="purchase_quantity"
          error={errors.purchase_quantity?.message}
        >
          <input
            id="purchase_quantity"
            type="number"
            min={0}
            step="0.0001"
            className={formInputClassName}
            {...register("purchase_quantity", { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormField
        label="Purchase unit"
        htmlFor="purchase_unit"
        error={errors.purchase_unit?.message}
        info="Standard unit for buying and costing this item. Used in recipes, stock tracking, and purchase receipts."
      >
        <UnitSelect
          id="purchase_unit"
          extraValue={purchaseUnit}
          {...register("purchase_unit")}
        />
      </FormField>

      <p className="rounded-md border border-border bg-background px-3 py-2 text-sm text-text-secondary">
        Estimated cost per {purchaseUnit || "unit"}:{" "}
        <span className="font-medium text-text-primary">Rs {previewCost}</span>
      </p>

      <FormField label="Status" htmlFor="is_active">
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            id="is_active"
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            {...register("is_active")}
          />
          Active
        </label>
      </FormField>

      <div className="space-y-4 rounded-lg border border-border p-4">
        <h3 className="text-sm font-medium text-text-primary">Inventory tracking</h3>
        <FormField
          label="Track inventory"
          htmlFor="track_inventory"
          info="When enabled, this item is included in stock balances, purchase receipts, and stock consumption reviews. Stock is tracked in lots with a full movement history."
        >
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
              id="track_inventory"
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              {...register("track_inventory")}
            />
            Include in stock balances and purchase receipts
          </label>
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Reorder level"
            htmlFor="reorder_level"
            error={errors.reorder_level?.message}
            hint="Optional low-stock threshold."
            info="The minimum quantity you want on hand before restocking. When stock falls to this level or below, the item is flagged as low stock on Stock Overview and dashboard alerts."
          >
            <input
              id="reorder_level"
              type="number"
              min={0}
              step="0.0001"
              className={formInputClassName}
              {...register("reorder_level", {
                setValueAs: (value) => (value === "" || value === null ? null : Number(value)),
              })}
            />
          </FormField>
          <FormField
            label="Reorder unit"
            htmlFor="reorder_unit"
            error={errors.reorder_unit?.message}
            info="The unit for the reorder threshold. Leave as “Same as purchase unit” unless you count stock differently."
          >
            <UnitSelect
              id="reorder_unit"
              allowEmpty
              emptyLabel="Same as purchase unit"
              extraValue={reorderUnit || undefined}
              value={reorderUnit}
              onChange={(event) =>
                setValue("reorder_unit", event.target.value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              onBlur={register("reorder_unit").onBlur}
              name={register("reorder_unit").name}
              ref={register("reorder_unit").ref}
            />
          </FormField>
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <PrimaryButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </PrimaryButton>
    </form>
  );
}
