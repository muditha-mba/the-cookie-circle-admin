"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import { deliveryAreaSchema, type DeliveryAreaFormValues } from "@/lib/validation/delivery-area";

type DeliveryAreaFormProps = {
  defaultValues?: Partial<DeliveryAreaFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: DeliveryAreaFormValues) => Promise<void>;
};

export function DeliveryAreaForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: DeliveryAreaFormProps) {
  const form = useForm<DeliveryAreaFormValues>({
    resolver: zodResolver(deliveryAreaSchema),
    defaultValues: {
      name: "",
      description: "",
      delivery_fee_override: "",
      pickup_only: false,
      is_active: true,
      ...defaultValues,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl space-y-6 rounded-lg border border-border bg-surface p-6"
      noValidate
    >
      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <input id="name" className={formInputClassName} {...register("name")} />
      </FormField>

      <FormField label="Description" htmlFor="description" error={errors.description?.message}>
        <textarea id="description" rows={3} className={formInputClassName} {...register("description")} />
      </FormField>

      <FormField
        label="Delivery fee override"
        htmlFor="delivery_fee_override"
        error={errors.delivery_fee_override?.message}
        hint="Leave empty to use the business default delivery fee. Pickup-only areas without an override use zero."
      >
        <input
          id="delivery_fee_override"
          type="number"
          min={0}
          step="0.01"
          className={formInputClassName}
          {...register("delivery_fee_override")}
        />
      </FormField>

      <FormField label="Pickup only" htmlFor="pickup_only">
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            id="pickup_only"
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            {...register("pickup_only")}
          />
          Customers collect from this area (no delivery fee unless overridden)
        </label>
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
