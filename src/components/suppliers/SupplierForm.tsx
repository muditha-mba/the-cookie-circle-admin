"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import { supplierSchema, type SupplierFormValues } from "@/lib/validation/supplier";

type SupplierFormProps = {
  defaultValues?: Partial<SupplierFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: SupplierFormValues) => Promise<void>;
};

export function SupplierForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      supplier_name: "",
      contact_person: "",
      email: "",
      phone: "",
      notes: "",
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
      <FormField
        label="Supplier name"
        htmlFor="supplier_name"
        error={errors.supplier_name?.message}
      >
        <input
          id="supplier_name"
          className={formInputClassName}
          {...register("supplier_name")}
        />
      </FormField>

      <FormField
        label="Contact person"
        htmlFor="contact_person"
        error={errors.contact_person?.message}
      >
        <input
          id="contact_person"
          className={formInputClassName}
          {...register("contact_person")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <input id="email" type="email" className={formInputClassName} {...register("email")} />
        </FormField>

        <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
          <input id="phone" className={formInputClassName} {...register("phone")} />
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="notes" error={errors.notes?.message}>
        <textarea id="notes" rows={4} className={formInputClassName} {...register("notes")} />
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
