"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import { billEntrySchema, type BillEntryFormValues } from "@/lib/validation/charge";
import { MONTH_NAMES } from "@/lib/format";

type BillEntryFormProps = {
  defaultValues?: Partial<BillEntryFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: BillEntryFormValues) => Promise<void>;
  onCancel?: () => void;
};

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

export function BillEntryForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
  onCancel,
}: BillEntryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BillEntryFormValues>({
    resolver: zodResolver(billEntrySchema),
    defaultValues: {
      year: currentYear,
      month: new Date().getMonth() + 1,
      amount: 0,
      notes: "",
      ...defaultValues,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-lg border border-border bg-surface p-4"
      noValidate
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <FormField label="Year" htmlFor="year" error={errors.year?.message}>
          <select id="year" className={formInputClassName} {...register("year", { valueAsNumber: true })}>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Month" htmlFor="month" error={errors.month?.message}>
          <select id="month" className={formInputClassName} {...register("month", { valueAsNumber: true })}>
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Amount (LKR)"
          htmlFor="amount"
          error={errors.amount?.message}
          className="sm:col-span-2"
        >
          <input
            id="amount"
            type="number"
            min={0}
            step="0.01"
            className={formInputClassName}
            {...register("amount", { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="notes" error={errors.notes?.message}>
        <input
          id="notes"
          type="text"
          className={formInputClassName}
          placeholder="Optional note (e.g. invoice number)"
          {...register("notes")}
        />
      </FormField>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex items-center gap-3">
        <PrimaryButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </PrimaryButton>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
