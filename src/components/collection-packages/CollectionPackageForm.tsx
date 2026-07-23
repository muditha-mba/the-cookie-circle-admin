"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton } from "@/components/data/PageActions";
import { FormField, formInputClassName } from "@/components/forms/FormField";
import {
  collectionPackageSchema,
  type CollectionPackageFormValues,
} from "@/lib/validation/collection-package";

const BADGE_TONE_OPTIONS = [
  { value: "violet", label: "Violet" },
  { value: "blue", label: "Blue" },
  { value: "amber", label: "Amber" },
  { value: "neutral", label: "Neutral" },
] as const;

const FEE_MODE_OPTIONS = [
  { value: "flat", label: "Flat fee per order" },
  { value: "per_cookie", label: "Fee per cookie" },
] as const;

function toPackageCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s_]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
}

type CollectionPackageFormProps = {
  defaultValues?: Partial<CollectionPackageFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: CollectionPackageFormValues) => Promise<void>;
};

export function CollectionPackageForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: CollectionPackageFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CollectionPackageFormValues>({
    resolver: zodResolver(collectionPackageSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      badge_tone: "violet",
      is_active: true,
      min_quantity: 4,
      max_quantity: 30,
      packaging_fee_mode: "flat",
      packaging_fee_amount: 0,
      ...defaultValues,
    },
  });
  const lastAutoCodeRef = useRef("");
  const nameValue = watch("name");
  const codeValue = watch("code");
  const feeMode = watch("packaging_fee_mode");

  useEffect(() => {
    const generated = toPackageCode(nameValue ?? "");
    if (!generated) {
      return;
    }

    if (!codeValue || codeValue === lastAutoCodeRef.current) {
      setValue("code", generated, { shouldValidate: true });
      lastAutoCodeRef.current = generated;
    }
  }, [nameValue, codeValue, setValue]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl space-y-6 rounded-lg border border-border bg-surface p-6"
      noValidate
    >
      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <input id="name" className={formInputClassName} {...register("name")} />
      </FormField>

      <FormField label="Code" htmlFor="code" error={errors.code?.message}>
        <input
          id="code"
          className={formInputClassName}
          placeholder="SPECIAL_EDITION"
          {...register("code")}
        />
      </FormField>

      <FormField
        label="Description"
        htmlFor="description"
        error={errors.description?.message}
      >
        <textarea
          id="description"
          rows={4}
          className={formInputClassName}
          {...register("description")}
        />
      </FormField>

      <FormField
        label="Badge tone"
        htmlFor="badge_tone"
        error={errors.badge_tone?.message}
      >
        <select id="badge_tone" className={formInputClassName} {...register("badge_tone")}>
          {BADGE_TONE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <div className="space-y-4 border-t border-border pt-6">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Order quantity range</h3>
          <p className="mt-1 text-xs text-text-muted">
            Customers can order any cookie count within this range for this collection.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Minimum cookies"
            htmlFor="min_quantity"
            error={errors.min_quantity?.message}
          >
            <input
              id="min_quantity"
              type="number"
              min={1}
              step={1}
              className={formInputClassName}
              {...register("min_quantity", { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label="Maximum cookies"
            htmlFor="max_quantity"
            error={errors.max_quantity?.message}
          >
            <input
              id="max_quantity"
              type="number"
              min={1}
              step={1}
              className={formInputClassName}
              {...register("max_quantity", { valueAsNumber: true })}
            />
          </FormField>
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-6">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Packaging fee</h3>
          <p className="mt-1 text-xs text-text-muted">
            Added to the cookie subtotal on the customer quote and checkout.
          </p>
        </div>
        <FormField
          label="Fee mode"
          htmlFor="packaging_fee_mode"
          error={errors.packaging_fee_mode?.message}
        >
          <select
            id="packaging_fee_mode"
            className={formInputClassName}
            {...register("packaging_fee_mode")}
          >
            {FEE_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label={
            feeMode === "per_cookie"
              ? "Fee per cookie (LKR)"
              : "Flat packaging fee (LKR)"
          }
          htmlFor="packaging_fee_amount"
          error={errors.packaging_fee_amount?.message}
        >
          <input
            id="packaging_fee_amount"
            type="number"
            min={0}
            step="0.01"
            className={formInputClassName}
            {...register("packaging_fee_amount", { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormField label="Status" htmlFor="is_active">
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            id="is_active"
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            {...register("is_active")}
          />
          Active (visible on website when at least one public package exists)
        </label>
      </FormField>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <PrimaryButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </PrimaryButton>
    </form>
  );
}
