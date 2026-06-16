"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton, SecondaryButton } from "@/components/data/PageActions";
import { FormField, formInputClassName } from "@/components/forms/FormField";
import type { SocialPlatform } from "@/lib/api/shared-memories";
import { fetchLinkPreviewFromAdmin } from "@/lib/link-preview/client";
import {
  sharedMemorySchema,
  type SharedMemoryFormValues,
} from "@/lib/validation/shared-memory";
import { cn } from "@/lib/utils";

const PLATFORM_OPTIONS: { value: SocialPlatform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
];

type PreviewStatus = "idle" | "loading" | "success" | "error";

type SharedMemoryFormProps = {
  defaultValues?: Partial<SharedMemoryFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: SharedMemoryFormValues) => Promise<void>;
};

export function SharedMemoryForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  error,
  onSubmit,
}: SharedMemoryFormProps) {
  const initialPostUrl = defaultValues?.post_url ?? "";
  const lastFetchedPostUrl = useRef(initialPostUrl.trim());

  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>("idle");
  const [previewMessage, setPreviewMessage] = useState<string | null>(null);

  const form = useForm<SharedMemoryFormValues>({
    resolver: zodResolver(sharedMemorySchema),
    defaultValues: {
      title: "",
      preview_image_url: "",
      post_url: "",
      platform: "instagram",
      sort_order: 0,
      is_active: true,
      ...defaultValues,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const postUrl = watch("post_url");
  const previewImageUrl = watch("preview_image_url");
  const title = watch("title");

  const fetchPreview = useCallback(
    async (rawUrl: string, { auto = false }: { auto?: boolean } = {}) => {
      const trimmedUrl = rawUrl.trim();

      if (!trimmedUrl) {
        if (!auto) {
          setPreviewStatus("error");
          setPreviewMessage("Enter a post URL before fetching a preview.");
        }
        return;
      }

      if (
        auto &&
        trimmedUrl === lastFetchedPostUrl.current &&
        previewImageUrl.trim()
      ) {
        return;
      }

      setPreviewStatus("loading");
      setPreviewMessage(
        auto ? "Fetching preview from the post link..." : "Fetching preview...",
      );

      try {
        const preview = await fetchLinkPreviewFromAdmin(trimmedUrl);

        setValue("preview_image_url", preview.preview_image_url, {
          shouldDirty: true,
          shouldValidate: true,
        });

        if (preview.title && !title.trim()) {
          setValue("title", preview.title, { shouldDirty: true, shouldValidate: true });
        }

        if (preview.platform) {
          setValue("platform", preview.platform, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }

        lastFetchedPostUrl.current = trimmedUrl;
        setPreviewStatus("success");
        setPreviewMessage(
          "Preview loaded. Save to cache a stable thumbnail; you can still edit the image URL manually.",
        );
      } catch (fetchError) {
        setPreviewStatus("error");
        setPreviewMessage(
          fetchError instanceof Error
            ? `${fetchError.message} Paste a preview image URL manually if needed.`
            : "Unable to fetch preview. Paste a preview image URL manually if needed.",
        );
      }
    },
    [previewImageUrl, setValue, title],
  );

  const handlePostUrlBlur = () => {
    const trimmedUrl = postUrl.trim();
    if (!trimmedUrl || trimmedUrl === lastFetchedPostUrl.current) {
      return;
    }

    void fetchPreview(trimmedUrl, { auto: true });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl space-y-6 rounded-lg border border-border bg-surface p-6"
      noValidate
    >
      <FormField
        label="Post URL"
        htmlFor="post_url"
        error={errors.post_url?.message}
        hint="Paste the social media post link. Preview image and platform are fetched automatically when possible."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="post_url"
            className={cn(formInputClassName, "min-w-0 flex-1")}
            {...register("post_url", {
              onBlur: handlePostUrlBlur,
            })}
          />
          <SecondaryButton
            type="button"
            disabled={previewStatus === "loading" || isSubmitting}
            onClick={() => void fetchPreview(postUrl)}
          >
            {previewStatus === "loading" ? "Fetching..." : "Fetch preview"}
          </SecondaryButton>
        </div>
      </FormField>

      {previewMessage ? (
        <p
          className={cn(
            "text-sm",
            previewStatus === "error"
              ? "text-danger"
              : previewStatus === "success"
                ? "text-success"
                : "text-text-muted",
          )}
        >
          {previewMessage}
        </p>
      ) : null}

      <FormField
        label="Preview image URL"
        htmlFor="preview_image_url"
        error={errors.preview_image_url?.message}
        hint="Auto-filled from the post link. On save, the image is uploaded to S3 and served via a stable API URL (not stored on disk)."
      >
        <input
          id="preview_image_url"
          className={formInputClassName}
          {...register("preview_image_url")}
        />
      </FormField>

      {previewImageUrl.trim() ? (
        <div className="overflow-hidden rounded-lg border border-border bg-surface-hover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImageUrl}
            alt={title.trim() || "Shared memory preview"}
            className="max-h-72 w-full object-cover"
            loading="lazy"
            onError={() => {
              setPreviewStatus("error");
              setPreviewMessage(
                "The preview image URL could not be loaded. Check the URL or paste a different image link.",
              );
            }}
          />
        </div>
      ) : null}

      <FormField
        label="Caption (optional)"
        htmlFor="title"
        error={errors.title?.message}
        hint="Used for accessibility and admin reference. Auto-filled when available."
      >
        <input id="title" className={formInputClassName} {...register("title")} />
      </FormField>

      <FormField label="Platform" htmlFor="platform" error={errors.platform?.message}>
        <select id="platform" className={formInputClassName} {...register("platform")}>
          {PLATFORM_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Sort order"
          htmlFor="sort_order"
          error={errors.sort_order?.message}
          hint="Lower numbers appear first in the carousel."
        >
          <input
            id="sort_order"
            type="number"
            min={0}
            className={formInputClassName}
            {...register("sort_order", { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="Website status" htmlFor="is_active">
          <label className="mt-2 flex items-center gap-2 text-sm text-text-primary">
            <input
              id="is_active"
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              {...register("is_active")}
            />
            Active on website
          </label>
        </FormField>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <PrimaryButton type="submit" disabled={isSubmitting || previewStatus === "loading"}>
        {isSubmitting ? "Saving..." : submitLabel}
      </PrimaryButton>
    </form>
  );
}
