"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import { taxChargeSchema, type TaxChargeFormValues } from "@/lib/validation/charge";

type TaxChargeFormProps = {
  defaultValues?: Partial<TaxChargeFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: TaxChargeFormValues) => Promise<void>;
};

export function TaxChargeForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: TaxChargeFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TaxChargeFormValues>({
    resolver: zodResolver(taxChargeSchema),
    defaultValues: {
      name: "",
      description: "",
      charge_type: "percentage",
      amount: 0,
      is_active: true,
      ...defaultValues,
    },
  });

  const chargeType = watch("charge_type");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl space-y-6 rounded-lg border border-border bg-surface p-6"
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
          placeholder="Optional description of what this tax is for"
          {...register("description")}
        />
      </FormField>

      <FormField
        label="Charge type"
        htmlFor="charge_type"
        error={errors.charge_type?.message}
      >
        <select id="charge_type" className={formInputClassName} {...register("charge_type")}>
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed amount (LKR)</option>
        </select>
      </FormField>

      <FormField
        label={chargeType === "percentage" ? "Rate (%)" : "Amount (LKR)"}
        htmlFor="amount"
        error={errors.amount?.message}
      >
        <input
          id="amount"
          type="number"
          min={0}
          step="0.01"
          max={chargeType === "percentage" ? 100 : undefined}
          className={formInputClassName}
          {...register("amount", { valueAsNumber: true })}
        />
      </FormField>

      <FormField label="Status" htmlFor="is_active">
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            id="is_active"
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            {...register("is_active")}
          />
          Active — apply to all orders
        </label>
      </FormField>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <PrimaryButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </PrimaryButton>
    </form>
  );
}
