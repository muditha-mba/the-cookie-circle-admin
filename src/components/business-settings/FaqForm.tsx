"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import { faqCategoriesApi } from "@/lib/api/faq-categories";
import { faqSchema, type FaqFormValues } from "@/lib/validation/faq";

type FaqFormProps = {
  defaultValues?: Partial<FaqFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: FaqFormValues) => Promise<void>;
};

export function FaqForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: FaqFormProps) {
  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      category_id: "",
      question: "",
      answer: "",
      sort_order: 0,
      is_active: true,
      ...defaultValues,
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["faq-categories"],
    queryFn: () => faqCategoriesApi.list(),
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
      <FormField label="Category" htmlFor="category_id" error={errors.category_id?.message}>
        <select
          id="category_id"
          className={formInputClassName}
          disabled={categoriesLoading}
          {...register("category_id")}
        >
          <option value="">Select a category</option>
          {(categories ?? []).map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Question" htmlFor="question" error={errors.question?.message}>
        <input id="question" className={formInputClassName} {...register("question")} />
      </FormField>

      <FormField label="Answer" htmlFor="answer" error={errors.answer?.message}>
        <textarea id="answer" rows={6} className={formInputClassName} {...register("answer")} />
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
