"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import {
  faqCategorySchema,
  type FaqCategoryFormValues,
} from "@/lib/validation/faq-category";

type FaqCategoryFormProps = {
  defaultValues?: Partial<FaqCategoryFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: FaqCategoryFormValues) => Promise<void>;
};

export function FaqCategoryForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: FaqCategoryFormProps) {
  const form = useForm<FaqCategoryFormValues>({
    resolver: zodResolver(faqCategorySchema),
    defaultValues: {
      name: "",
      sort_order: 0,
      is_active: true,
      ...defaultValues,
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
      className="max-w-xl space-y-6 rounded-lg border border-border bg-surface p-6"
      noValidate
    >
      <FormField label="Category name" htmlFor="name" error={errors.name?.message}>
        <input id="name" className={formInputClassName} {...register("name")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Sort order"
          htmlFor="sort_order"
          error={errors.sort_order?.message}
          hint="Lower numbers appear first on the website."
        >
          <input
            id="sort_order"
            type="number"
            min={0}
            className={formInputClassName}
            {...register("sort_order", { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Status" htmlFor="is_active">
          <label className="mt-2 flex items-center gap-2 text-sm text-text-primary">
            <input
              id="is_active"
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              {...register("is_active")}
            />
            Visible on website
          </label>
        </FormField>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <PrimaryButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </PrimaryButton>
    </form>
  );
}
