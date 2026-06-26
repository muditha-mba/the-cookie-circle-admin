"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PromotionSlideForm } from "./PromotionSlideForm";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { PageActions } from "@/components/data/PageActions";
import { promotionSlidesApi } from "@/lib/api/promotion-slides";
import type { PromotionSlideFormValues } from "@/lib/validation/promotion-slide";
import { routes } from "@/config/routes";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

export function PromotionSlideNewPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: PromotionSlideFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await promotionSlidesApi.create({
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
      notifyActionSuccess("Promotion slide created successfully.");
      router.push(routes.promotions.slides.list);
    } catch (err) {
      notifyActionError(err, "Failed to create promotion slide.", setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPageShell
      title="New Promotion Slide"
      description="Add a marketing slide to the client carousel."
    >
      <PageActions backHref={routes.promotions.slides.list} backLabel="Back to slides" className="mb-6" />
      <PromotionSlideForm
        submitLabel="Create slide"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
