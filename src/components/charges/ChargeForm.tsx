"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import { chargeSchema, type ChargeFormValues } from "@/lib/validation/charge";

type ChargeFormProps = {
  defaultValues?: Partial<ChargeFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: ChargeFormValues) => Promise<void>;
};

export function ChargeForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: ChargeFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChargeFormValues>({
    resolver: zodResolver(chargeSchema),
    defaultValues: {
      name: "",
      description: "",
      charge_type: "fixed",
      amount: 1,
      applicability: "both",
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
          rows={4}
          className={formInputClassName}
          {...register("description")}
        />
      </FormField>

      <FormField
        label="Applicability"
        htmlFor="applicability"
        error={errors.applicability?.message}
        hint="Where this charge can be attached"
      >
        <select id="applicability" className={formInputClassName} {...register("applicability")}>
          <option value="product">Product only</option>
          <option value="collection">Collection only</option>
          <option value="both">Product and collection</option>
        </select>
      </FormField>

      <FormField
        label="Charge type"
        htmlFor="charge_type"
        error={errors.charge_type?.message}
      >
        <select id="charge_type" className={formInputClassName} {...register("charge_type")}>
          <option value="fixed">Fixed amount (LKR)</option>
          <option value="percentage">Percentage (%)</option>
        </select>
      </FormField>

      <FormField
        label={chargeType === "percentage" ? "Amount (%)" : "Amount (LKR)"}
        htmlFor="amount"
        error={errors.amount?.message}
        hint={
          chargeType === "percentage"
            ? "Enter a value between 0 and 100"
            : "Fixed charge in Sri Lankan Rupees"
        }
      >
        <input
          id="amount"
          type="number"
          min={0}
          step={chargeType === "percentage" ? "0.01" : "0.01"}
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
          Active
        </label>
      </FormField>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <PrimaryButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </PrimaryButton>
    </form>
  );
}
