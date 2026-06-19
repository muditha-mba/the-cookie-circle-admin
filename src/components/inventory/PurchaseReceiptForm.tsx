"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton, SecondaryButton } from "@/components/data/PageActions";
import type { ProductItem } from "@/lib/api/product-items";
import type { Supplier } from "@/lib/api/suppliers";
import {
  purchaseReceiptSchema,
  type PurchaseReceiptFormValues,
} from "@/lib/validation/inventory";

type PurchaseReceiptFormProps = {
  suppliers: Supplier[];
  productItems: ProductItem[];
  defaultValues?: Partial<PurchaseReceiptFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: PurchaseReceiptFormValues) => Promise<void>;
};

export function PurchaseReceiptForm({
  suppliers,
  productItems,
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: PurchaseReceiptFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PurchaseReceiptFormValues>({
    resolver: zodResolver(purchaseReceiptSchema),
    defaultValues: {
      supplier_id: "",
      receipt_date: new Date().toISOString().slice(0, 10),
      reference_number: "",
      notes: "",
      lines: [
        {
          product_item_id: "",
          quantity: 1,
          unit: "grams",
          unit_cost: 0,
          expires_at: "",
        },
      ],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-3xl space-y-6 rounded-lg border border-border bg-surface p-6"
      noValidate
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Supplier" htmlFor="supplier_id" error={errors.supplier_id?.message}>
          <select id="supplier_id" className={formInputClassName} {...register("supplier_id")}>
            <option value="">Select supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.supplier_name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Receipt date" htmlFor="receipt_date" error={errors.receipt_date?.message}>
          <input id="receipt_date" type="date" className={formInputClassName} {...register("receipt_date")} />
        </FormField>
      </div>

      <FormField
        label="Reference number"
        htmlFor="reference_number"
        error={errors.reference_number?.message}
        hint="Supplier invoice or receipt number. Optional."
      >
        <input id="reference_number" className={formInputClassName} {...register("reference_number")} />
      </FormField>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-primary">Line items</h3>
          <SecondaryButton
            type="button"
            onClick={() =>
              append({
                product_item_id: "",
                quantity: 1,
                unit: "grams",
                unit_cost: 0,
                expires_at: "",
              })
            }
          >
            Add line
          </SecondaryButton>
        </div>

        {errors.lines?.message ? (
          <p className="text-sm text-danger">{errors.lines.message}</p>
        ) : null}

        {fields.map((field, index) => (
          <div key={field.id} className="space-y-4 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-secondary">Line {index + 1}</p>
              {fields.length > 1 ? (
                <SecondaryButton type="button" onClick={() => remove(index)}>
                  Remove
                </SecondaryButton>
              ) : null}
            </div>

            <FormField
              label="Product item"
              htmlFor={`lines.${index}.product_item_id`}
              error={errors.lines?.[index]?.product_item_id?.message}
            >
              <select
                className={formInputClassName}
                {...register(`lines.${index}.product_item_id`)}
              >
                <option value="">Select item</option>
                {productItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {!item.track_inventory ? " (tracking off)" : ""}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Quantity"
                htmlFor={`lines.${index}.quantity`}
                error={errors.lines?.[index]?.quantity?.message}
              >
                <input
                  type="number"
                  step="any"
                  className={formInputClassName}
                  {...register(`lines.${index}.quantity`, { valueAsNumber: true })}
                />
              </FormField>
              <FormField
                label="Unit"
                htmlFor={`lines.${index}.unit`}
                error={errors.lines?.[index]?.unit?.message}
              >
                <input className={formInputClassName} {...register(`lines.${index}.unit`)} />
              </FormField>
              <FormField
                label="Unit cost"
                htmlFor={`lines.${index}.unit_cost`}
                error={errors.lines?.[index]?.unit_cost?.message}
              >
                <input
                  type="number"
                  step="any"
                  className={formInputClassName}
                  {...register(`lines.${index}.unit_cost`, { valueAsNumber: true })}
                />
              </FormField>
              <FormField
                label="Expires"
                htmlFor={`lines.${index}.expires_at`}
                error={errors.lines?.[index]?.expires_at?.message}
                hint="Optional expiry for this lot."
              >
                <input
                  type="date"
                  className={formInputClassName}
                  {...register(`lines.${index}.expires_at`)}
                />
              </FormField>
            </div>
          </div>
        ))}
      </div>

      <FormField label="Notes" htmlFor="notes" error={errors.notes?.message}>
        <textarea id="notes" rows={3} className={formInputClassName} {...register("notes")} />
      </FormField>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <PrimaryButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </PrimaryButton>
    </form>
  );
}
