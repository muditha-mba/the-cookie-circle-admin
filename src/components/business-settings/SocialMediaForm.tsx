"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormField, formInputClassName } from "@/components/forms/FormField";
import { PrimaryButton } from "@/components/data/PageActions";
import type { SocialMediaLink, SocialPlatform } from "@/lib/api/social-media";
import {
  socialMediaSettingsSchema,
  type SocialMediaSettingsFormValues,
} from "@/lib/validation/social-media";

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
};

type SocialMediaFormProps = {
  defaultValues: SocialMediaLink[];
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: SocialMediaSettingsFormValues) => Promise<void>;
};

export function SocialMediaForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: SocialMediaFormProps) {
  const form = useForm<SocialMediaSettingsFormValues>({
    resolver: zodResolver(socialMediaSettingsSchema),
    defaultValues: { links: defaultValues },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-3xl space-y-6 rounded-lg border border-border bg-surface p-6"
      noValidate
    >
      <div>
        <h3 className="text-sm font-semibold text-text-primary">Social media links</h3>
        <p className="mt-1 text-xs text-text-muted">
          Active links appear in the client website footer. Deactivated links are hidden.
        </p>
      </div>

      <div className="space-y-4">
        {defaultValues.map((link, index) => (
          <div
            key={link.platform}
            className="rounded-md border border-border bg-surface-elevated p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-medium text-text-primary">
                {PLATFORM_LABELS[link.platform]}
              </h4>
              <label className="flex items-center gap-2 text-sm text-text-primary">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  {...register(`links.${index}.is_enabled`)}
                />
                Active on website
              </label>
            </div>

            <input type="hidden" {...register(`links.${index}.platform`)} />

            <div className="mt-3">
              <FormField
                label="Profile URL"
                htmlFor={`links.${index}.url`}
                error={errors.links?.[index]?.url?.message}
              >
                <input
                  id={`links.${index}.url`}
                  type="url"
                  placeholder="https://"
                  className={formInputClassName}
                  {...register(`links.${index}.url`)}
                />
              </FormField>
            </div>
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <PrimaryButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </PrimaryButton>
    </form>
  );
}
