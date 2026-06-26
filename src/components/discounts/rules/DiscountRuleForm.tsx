"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import {
  discountRuleSchema,
  type DiscountRuleFormValues,
} from "@/lib/validation/discount-rule";

type DiscountRuleFormProps = {
  defaultValues?: Partial<DiscountRuleFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: DiscountRuleFormValues) => Promise<void>;
};

export function DiscountRuleForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: DiscountRuleFormProps) {
  const form = useForm<DiscountRuleFormValues>({
    resolver: zodResolver(discountRuleSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? null,
      rule_type: defaultValues?.rule_type ?? "order_frequency_in_window",
      config: defaultValues?.config ?? {
        required_order_count: 2,
        window_days: 30,
        discount_type: "percentage",
        discount_value: 10,
        image_url: "",
        grant_expires_days: null,
      },
      priority: defaultValues?.priority ?? 100,
      is_active: defaultValues?.is_active ?? true,
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const discountType = watch("config.discount_type");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl space-y-6 rounded-lg border border-border bg-surface p-6"
      noValidate
    >
      <FormField label="Rule name" htmlFor="name" error={errors.name?.message}>
        <input
          id="name"
          type="text"
          className={formInputClassName}
          placeholder="e.g. Returning Customer Discount"
          {...register("name")}
        />
      </FormField>

      <FormField
        label="Description"
        htmlFor="description"
        error={errors.description?.message}
      >
        <textarea
          id="description"
          rows={2}
          className={formInputClassName}
          placeholder="Describe when this rule triggers..."
          {...register("description")}
        />
      </FormField>

      <FormField label="Priority" htmlFor="priority" error={errors.priority?.message}>
        <input
          id="priority"
          type="number"
          min={1}
          max={999}
          className={formInputClassName}
          {...register("priority", { valueAsNumber: true })}
        />
        <p className="mt-1 text-xs text-text-muted">
          Lower number = higher priority. Used when multiple rules qualify.
        </p>
      </FormField>

      <div className="border-t border-border pt-6">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          Rule — Order Frequency in Window
        </h3>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Required order count"
              htmlFor="config.required_order_count"
              error={errors.config?.required_order_count?.message}
            >
              <input
                id="config.required_order_count"
                type="number"
                min={2}
                className={formInputClassName}
                {...register("config.required_order_count", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Window (days)"
              htmlFor="config.window_days"
              error={errors.config?.window_days?.message}
            >
              <input
                id="config.window_days"
                type="number"
                min={1}
                max={365}
                className={formInputClassName}
                {...register("config.window_days", { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Discount type"
              htmlFor="config.discount_type"
              error={errors.config?.discount_type?.message}
            >
              <select
                id="config.discount_type"
                className={formInputClassName}
                {...register("config.discount_type")}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount (LKR)</option>
              </select>
            </FormField>
            <FormField
              label={discountType === "percentage" ? "Discount %" : "Discount (LKR)"}
              htmlFor="config.discount_value"
              error={errors.config?.discount_value?.message}
            >
              <input
                id="config.discount_value"
                type="number"
                min={0.01}
                step="0.01"
                className={formInputClassName}
                {...register("config.discount_value", { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <FormField
            label="Banner image URL"
            htmlFor="config.image_url"
            error={errors.config?.image_url?.message}
          >
            <input
              id="config.image_url"
              type="url"
              className={formInputClassName}
              placeholder="https://..."
              {...register("config.image_url")}
            />
            <p className="mt-1 text-xs text-text-muted">
              Shown in the client promotions banner when this discount is granted.
            </p>
          </FormField>

          <FormField
            label="Grant expires after (days)"
            htmlFor="config.grant_expires_days"
            error={errors.config?.grant_expires_days?.message}
          >
            <input
              id="config.grant_expires_days"
              type="number"
              min={1}
              max={365}
              className={formInputClassName}
              placeholder="Leave blank — grant never expires"
              {...register("config.grant_expires_days", {
                setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
              })}
            />
          </FormField>
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-md border border-border bg-surface-elevated px-4 py-3">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-border"
          {...register("is_active")}
        />
        <span className="space-y-1">
          <span className="block text-sm font-medium text-text-primary">Active</span>
          <span className="block text-xs text-text-muted">
            When active, this rule is evaluated after every completed order.
          </span>
        </span>
      </label>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <PrimaryButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </PrimaryButton>
    </form>
  );
}
