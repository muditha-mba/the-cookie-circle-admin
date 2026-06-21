"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PromotionSlideForm } from "./PromotionSlideForm";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { PageActions } from "@/components/data/PageActions";
import { promotionSlidesApi } from "@/lib/api/promotion-slides";
import type { PromotionSlideFormValues } from "@/lib/validation/promotion-slide";
import { routes } from "@/config/routes";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

type Props = { slideId: string };

export function PromotionSlideEditPage({ slideId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["promotion-slide", slideId],
    queryFn: () => promotionSlidesApi.get(slideId),
    enabled: !!slideId,
  });

  const handleSubmit = async (values: PromotionSlideFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await promotionSlidesApi.update(slideId, {
        title: values.title,
        description: values.description,
        image_url: values.image_url,
        cta_text: values.cta_text,
        cta_destination: values.cta_destination,
        sort_order: values.sort_order,
        starts_at: values.starts_at || null,
        ends_at: values.ends_at || null,
        is_active: values.is_active,
      });
      queryClient.invalidateQueries({ queryKey: ["promotion-slides"] });
      notifyActionSuccess("Changes saved successfully.");
      router.push(routes.promotions.slides.list);
    } catch (err) {
      notifyActionError(err, "Failed to update promotion slide.", setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Edit Promotion Slide">
        <div className="h-64 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Edit Promotion Slide">
        <p className="text-sm text-danger">Slide could not be loaded.</p>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={`Edit — ${data.title}`}
    >
      <PageActions backHref={routes.promotions.slides.list} backLabel="Back to slides" className="mb-6" />
      <PromotionSlideForm
        defaultValues={{
          title: data.title,
          description: data.description,
          image_url: data.image_url,
          cta_text: data.cta_text,
          cta_destination: data.cta_destination,
          sort_order: data.sort_order,
          starts_at: data.starts_at,
          ends_at: data.ends_at,
          is_active: data.is_active,
        }}
        submitLabel="Save changes"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
