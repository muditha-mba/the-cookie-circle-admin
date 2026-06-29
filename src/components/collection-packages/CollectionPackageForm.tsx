"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton } from "@/components/data/PageActions";
import { FormField, formInputClassName } from "@/components/forms/FormField";
import {
  collectionPackageSchema,
  type CollectionPackageFormValues,
} from "@/lib/validation/collection-package";

const BADGE_TONE_OPTIONS = [
  { value: "violet", label: "Violet" },
  { value: "blue", label: "Blue" },
  { value: "amber", label: "Amber" },
  { value: "neutral", label: "Neutral" },
] as const;

function toPackageCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s_]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
}

type CollectionPackageFormProps = {
  defaultValues?: Partial<CollectionPackageFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: CollectionPackageFormValues) => Promise<void>;
};

export function CollectionPackageForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: CollectionPackageFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CollectionPackageFormValues>({
    resolver: zodResolver(collectionPackageSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      badge_tone: "violet",
      is_active: true,
      ...defaultValues,
    },
  });
  const lastAutoCodeRef = useRef("");
  const nameValue = watch("name");
  const codeValue = watch("code");

  useEffect(() => {
    const generated = toPackageCode(nameValue ?? "");
    if (!generated) {
      return;
    }

    // Auto-fill until the user customizes code manually.
    if (!codeValue || codeValue === lastAutoCodeRef.current) {
      setValue("code", generated, { shouldValidate: true });
      lastAutoCodeRef.current = generated;
    }
  }, [nameValue, codeValue, setValue]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl space-y-6 rounded-lg border border-border bg-surface p-6"
      noValidate
    >
      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <input id="name" className={formInputClassName} {...register("name")} />
      </FormField>

      <FormField label="Code" htmlFor="code" error={errors.code?.message}>
        <input
          id="code"
          className={formInputClassName}
          placeholder="SPECIAL_EDITION"
          {...register("code")}
        />
      </FormField>

      <FormField
        label="Description"
        htmlFor="description"
        error={errors.description?.message}
      >
        <textarea
          id="description"
          rows={4}
          className={formInputClassName}
          {...register("description")}
        />
      </FormField>

      <FormField
        label="Badge tone"
        htmlFor="badge_tone"
        error={errors.badge_tone?.message}
      >
        <select id="badge_tone" className={formInputClassName} {...register("badge_tone")}>
          {BADGE_TONE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
