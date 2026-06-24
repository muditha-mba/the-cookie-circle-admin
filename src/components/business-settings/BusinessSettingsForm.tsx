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
      use_fixed_delivery_fee: defaultValues.use_fixed_delivery_fee,
      order_cutoff_day: defaultValues.order_cutoff_day,
      delivery_day: defaultValues.delivery_day,
      online_card_enabled: defaultValues.online_card_enabled,
      online_bank_debit_enabled: defaultValues.online_bank_debit_enabled,
      bank_transfer_enabled: defaultValues.bank_transfer_enabled,
      cod_enabled: defaultValues.cod_enabled,
      discounts_enabled: defaultValues.discounts_enabled,
      bank_name: defaultValues.bank_transfer_details.bank_name,
      bank_account_name: defaultValues.bank_transfer_details.account_name,
      bank_account_number: defaultValues.bank_transfer_details.account_number,
      bank_branch: defaultValues.bank_transfer_details.branch,
      bank_transfer_instructions: defaultValues.bank_transfer_details.instructions,
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

      <label className="flex items-start gap-3 rounded-md border border-border bg-surface-elevated px-4 py-3">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-border"
          {...register("use_fixed_delivery_fee")}
        />
        <span className="space-y-1">
          <span className="block text-sm font-medium text-text-primary">
            Use fixed delivery fee
          </span>
          <span className="block text-xs text-text-muted">
            When enabled, every order uses the delivery fee below. When disabled,
            delivery fees come from each delivery area&apos;s configured rate.
          </span>
        </span>
      </label>

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
        <h3 className="text-sm font-semibold text-text-primary">Payment options</h3>
        <p className="mt-1 text-xs text-text-muted">
          Online methods stay disabled until WebXPay integration is live
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
          Manual bank transfer enabled
        </label>
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            {...register("online_card_enabled")}
          />
          Online card payments enabled (WebXPay)
        </label>
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border"
            {...register("online_bank_debit_enabled")}
          />
          Online bank debit enabled (JustPay / WebXPay)
        </label>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-text-primary">Bank transfer details</h3>
        <p className="mt-1 text-xs text-text-muted">
          Shown to customers who pay by manual bank transfer
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Bank name" htmlFor="bank_name" error={errors.bank_name?.message}>
          <input id="bank_name" className={formInputClassName} {...register("bank_name")} />
        </FormField>
        <FormField
          label="Account name"
          htmlFor="bank_account_name"
          error={errors.bank_account_name?.message}
        >
          <input
            id="bank_account_name"
            className={formInputClassName}
            {...register("bank_account_name")}
          />
        </FormField>
        <FormField
          label="Account number"
          htmlFor="bank_account_number"
          error={errors.bank_account_number?.message}
        >
          <input
            id="bank_account_number"
            className={formInputClassName}
            {...register("bank_account_number")}
          />
        </FormField>
        <FormField label="Branch" htmlFor="bank_branch" error={errors.bank_branch?.message}>
          <input id="bank_branch" className={formInputClassName} {...register("bank_branch")} />
        </FormField>
      </div>

      <FormField
        label="Transfer instructions"
        htmlFor="bank_transfer_instructions"
        error={errors.bank_transfer_instructions?.message}
      >
        <textarea
          id="bank_transfer_instructions"
          rows={3}
          className={formInputClassName}
          {...register("bank_transfer_instructions")}
        />
      </FormField>

      <div className="border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-text-primary">Discounts</h3>
        <p className="mt-1 text-xs text-text-muted">
          Master switch for all discount and grant functionality. Must be enabled before any discounts
          are applied to orders.
        </p>
      </div>

      <label className="flex items-start gap-3 rounded-md border border-border bg-surface-elevated px-4 py-3">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-border"
          {...register("discounts_enabled")}
        />
        <span className="space-y-1">
          <span className="block text-sm font-medium text-text-primary">
            Enable discounts
          </span>
          <span className="block text-xs text-text-muted">
            When enabled, eligible customers may receive automatic or manually granted discounts on
            their orders. Rules, grants, and promotions are evaluated only when this is on.
          </span>
        </span>
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <PrimaryButton type="submit" disabled={isSubmitting}>
        {submitLabel}
      </PrimaryButton>
    </form>
  );
}
