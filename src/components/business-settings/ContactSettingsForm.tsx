"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import type { BusinessSettings } from "@/lib/api/business-settings";
import {
  contactSettingsSchema,
  type ContactSettingsFormValues,
} from "@/lib/validation/contact-settings";

type ContactSettingsFormProps = {
  defaultValues: BusinessSettings;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: ContactSettingsFormValues) => Promise<void>;
};

export function ContactSettingsForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: ContactSettingsFormProps) {
  const form = useForm<ContactSettingsFormValues>({
    resolver: zodResolver(contactSettingsSchema),
    defaultValues: {
      business_phone: defaultValues.business_phone,
      business_email: defaultValues.business_email,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl space-y-6 rounded-lg border border-border bg-surface p-6"
      noValidate
    >
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Website contact details</h3>
        <p className="mt-1 text-xs text-text-muted">
          Shown in the client website footer for assistance and phone orders.
        </p>
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

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <PrimaryButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </PrimaryButton>
    </form>
  );
}
