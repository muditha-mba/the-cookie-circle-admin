"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";

import { CustomerUserSearchSelect } from "@/components/customers/CustomerUserSearchSelect";
import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import type { LinkableUser } from "@/lib/api/users";
import { customerSchema, type CustomerFormValues } from "@/lib/validation/customer";

type CustomerFormProps = {
  defaultValues?: Partial<CustomerFormValues>;
  linkedUser?: LinkableUser | null;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
};

export function CustomerForm({
  defaultValues,
  linkedUser = null,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: CustomerFormProps) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      postal_code: "",
      landmark: "",
      source: "manual",
      marketing_source: "",
      notes: "",
      is_active: true,
      user_id: "",
      ...defaultValues,
    },
  });

  const { register, handleSubmit, control, setValue, formState: { errors } } = form;
  const source = useWatch({ control, name: "source" });

  useEffect(() => {
    if (source !== "registered") {
      setValue("user_id", "");
    }
  }, [source, setValue]);

  const applyLinkedUser = (user: LinkableUser | null) => {
    if (!user) {
      return;
    }
    setValue("first_name", user.first_name ?? "", { shouldValidate: true });
    setValue("last_name", user.last_name ?? "", { shouldValidate: true });
    setValue("email", user.email, { shouldValidate: true });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl space-y-6 rounded-lg border border-border bg-surface p-6"
      noValidate
    >
      <FormField label="Source" htmlFor="source" error={errors.source?.message}>
        <select id="source" className={formInputClassName} {...register("source")}>
          <option value="manual">Manual</option>
          <option value="guest">Guest</option>
          <option value="registered">Registered</option>
        </select>
      </FormField>

      {source === "registered" ? (
        <FormField
          label="Linked user"
          htmlFor="user_id"
          error={errors.user_id?.message}
          hint="Search by name, email, or user ID. Selecting a user fills the profile fields below."
        >
          <Controller
            control={control}
            name="user_id"
            render={({ field }) => (
              <CustomerUserSearchSelect
                value={field.value ?? ""}
                initialUser={linkedUser}
                onChange={(userId, user) => {
                  field.onChange(userId);
                  applyLinkedUser(user);
                }}
              />
            )}
          />
        </FormField>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor="first_name" error={errors.first_name?.message}>
          <input id="first_name" className={formInputClassName} {...register("first_name")} />
        </FormField>
        <FormField label="Last name" htmlFor="last_name" error={errors.last_name?.message}>
          <input id="last_name" className={formInputClassName} {...register("last_name")} />
        </FormField>
      </div>

      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <input id="email" type="email" className={formInputClassName} {...register("email")} />
      </FormField>

      <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
        <input id="phone" className={formInputClassName} {...register("phone")} />
      </FormField>

      <FormField
        label="Marketing source"
        htmlFor="marketing_source"
        error={errors.marketing_source?.message}
        hint="How this customer discovered the business."
      >
        <select
          id="marketing_source"
          className={formInputClassName}
          {...register("marketing_source")}
        >
          <option value="">Not specified</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="referral">Referral</option>
          <option value="google">Google</option>
          <option value="walk_in">Walk In</option>
          <option value="other">Other</option>
        </select>
      </FormField>

      <div className="space-y-4 border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-text-primary">Default address</h3>
        <p className="text-xs text-text-muted">Used as defaults when placing orders — not copied automatically on every order.</p>
        <FormField label="Address line 1" htmlFor="address_line_1">
          <input id="address_line_1" className={formInputClassName} {...register("address_line_1")} />
        </FormField>
        <FormField label="Address line 2" htmlFor="address_line_2">
          <input id="address_line_2" className={formInputClassName} {...register("address_line_2")} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="City" htmlFor="city">
            <input id="city" className={formInputClassName} {...register("city")} />
          </FormField>
          <FormField label="Postal code" htmlFor="postal_code">
            <input id="postal_code" className={formInputClassName} {...register("postal_code")} />
          </FormField>
        </div>
        <FormField label="Landmark" htmlFor="landmark">
          <input id="landmark" className={formInputClassName} {...register("landmark")} />
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="notes" error={errors.notes?.message}>
        <textarea id="notes" rows={3} className={formInputClassName} {...register("notes")} />
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
