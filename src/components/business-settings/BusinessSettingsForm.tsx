"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import type { BusinessSettings } from "@/lib/api/business-settings";
import {
  businessSettingsSchema,
  type BusinessSettingsFormValues,
} from "@/lib/validation/business-settings";

const WEEKDAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
] as const;

type BusinessSettingsFormProps = {
  defaultValues: BusinessSettings;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: BusinessSettingsFormValues) => Promise<void>;
};

export function BusinessSettingsForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: BusinessSettingsFormProps) {
  const form = useForm<BusinessSettingsFormValues>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: {
      delivery_fee: Number(defaultValues.delivery_fee),
      order_cutoff_day: defaultValues.order_cutoff_day,
      delivery_day: defaultValues.delivery_day,
      business_phone: defaultValues.business_phone,
      business_email: defaultValues.business_email,
      stripe_enabled: defaultValues.stripe_enabled,
      bank_transfer_enabled: defaultValues.bank_transfer_enabled,
      cod_enabled: defaultValues.cod_enabled,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl space-y-6 rounded-lg border border-border bg-surface p-6"
      noValidate
    >
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Delivery schedule</h3>
        <p className="mt-1 text-xs text-text-muted">
          Controls suggested delivery dates for new orders
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Order cutoff day"
          htmlFor="order_cutoff_day"
          error={errors.order_cutoff_day?.message}
        >
          <select id="order_cutoff_day" className={formInputClassName} {...register("order_cutoff_day")}>
            {WEEKDAYS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label="Delivery day"
          htmlFor="delivery_day"
          error={errors.delivery_day?.message}
        >
          <select id="delivery_day" className={formInputClassName} {...register("delivery_day")}>
            {WEEKDAYS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField
        label="Delivery fee (LKR)"
        htmlFor="delivery_fee"
        error={errors.delivery_fee?.message}
      >
        <input
          id="delivery_fee"
          type="number"
          min={0}
          step="0.01"
          className={formInputClassName}
          {...register("delivery_fee", { valueAsNumber: true })}
        />
      </FormField>

      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-text-primary">Contact</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Business phone"
          htmlFor="business_phone"
          error={errors.business_phone?.message}
        >
          <input id="business_phone" className={formInputClassName} {...register("business_phone")} />
        </FormField>
        <FormField
          label="Business email"
          htmlFor="business_email"
          error={errors.business_email?.message}
        >
          <input
            id="business_email"
            type="email"
            className={formInputClassName}
            {...register("business_email")}
          />
        </FormField>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-text-primary">Payment options</h3>
        <p className="mt-1 text-xs text-text-muted">
          Flags for future checkout — no gateway integration in this phase
        </p>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input type="checkbox" className="h-4 w-4 rounded border-border" {...register("cod_enabled")} />
          Cash on delivery enabled
        </label>
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            {...register("bank_transfer_enabled")}
          />
          Bank transfer enabled
        </label>
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            {...register("stripe_enabled")}
          />
          Stripe enabled
        </label>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <PrimaryButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </PrimaryButton>
    </form>
  );
}
