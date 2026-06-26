"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import { overheadChargeSchema, type OverheadChargeFormValues } from "@/lib/validation/charge";

type OverheadChargeFormProps = {
  defaultValues?: Partial<OverheadChargeFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: OverheadChargeFormValues) => Promise<void>;
};

export function OverheadChargeForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: OverheadChargeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OverheadChargeFormValues>({
    resolver: zodResolver(overheadChargeSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
      ...defaultValues,
    },
  });

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
        hint="Optional notes about this overhead category"
      >
        <textarea
          id="description"
          rows={4}
          className={formInputClassName}
          {...register("description")}
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
