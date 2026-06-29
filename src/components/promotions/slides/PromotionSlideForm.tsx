"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import {
  promotionSlideSchema,
  type PromotionSlideFormValues,
} from "@/lib/validation/promotion-slide";

type PromotionSlideFormProps = {
  defaultValues?: Partial<PromotionSlideFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: PromotionSlideFormValues) => Promise<void>;
};

export function PromotionSlideForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: PromotionSlideFormProps) {
  const form = useForm<PromotionSlideFormValues>({
    resolver: zodResolver(promotionSlideSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? null,
      image_url: defaultValues?.image_url ?? "",
      cta_text: defaultValues?.cta_text ?? null,
      cta_destination: defaultValues?.cta_destination ?? null,
      sort_order: defaultValues?.sort_order ?? 0,
      starts_at: defaultValues?.starts_at ?? null,
      ends_at: defaultValues?.ends_at ?? null,
      is_active: defaultValues?.is_active ?? true,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl space-y-6 rounded-lg border border-border bg-surface p-6"
      noValidate
    >
      <FormField label="Title" htmlFor="title" error={errors.title?.message}>
        <input
          id="title"
          type="text"
          className={formInputClassName}
          placeholder="e.g. Weekend Special"
          {...register("title")}
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
          placeholder="Short promotional text shown on the slide..."
          {...register("description")}
        />
      </FormField>

      <FormField
        label="Image URL"
        htmlFor="image_url"
        error={errors.image_url?.message}
      >
        <input
          id="image_url"
          type="url"
          className={formInputClassName}
          placeholder="https://..."
          {...register("image_url")}
        />
        <p className="mt-1 text-xs text-text-muted">
          Must be a publicly accessible https:// URL.
        </p>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="CTA button text"
          htmlFor="cta_text"
          error={errors.cta_text?.message}
        >
          <input
            id="cta_text"
            type="text"
            className={formInputClassName}
            placeholder="e.g. Shop Now"
            {...register("cta_text")}
          />
        </FormField>
        <FormField
          label="CTA destination URL"
          htmlFor="cta_destination"
          error={errors.cta_destination?.message}
        >
          <input
            id="cta_destination"
            type="text"
            className={formInputClassName}
            placeholder="/shop or https://..."
            {...register("cta_destination")}
          />
        </FormField>
      </div>

      <FormField
        label="Sort order"
        htmlFor="sort_order"
        error={errors.sort_order?.message}
      >
        <input
          id="sort_order"
          type="number"
          min={0}
          className={formInputClassName}
          {...register("sort_order", { valueAsNumber: true })}
        />
        <p className="mt-1 text-xs text-text-muted">
          Lower numbers appear first in the carousel.
        </p>
      </FormField>

      <div className="border-t border-border pt-6">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Schedule (optional)</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Show from"
            htmlFor="starts_at"
            error={errors.starts_at?.message}
          >
            <input
              id="starts_at"
              type="datetime-local"
              className={formInputClassName}
              {...register("starts_at")}
            />
          </FormField>
          <FormField
            label="Hide after"
            htmlFor="ends_at"
            error={errors.ends_at?.message}
          >
            <input
              id="ends_at"
              type="datetime-local"
              className={formInputClassName}
              {...register("ends_at")}
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
            Show this slide in the client carousel (subject to schedule).
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
