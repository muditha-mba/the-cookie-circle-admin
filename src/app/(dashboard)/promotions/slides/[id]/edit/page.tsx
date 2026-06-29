"use client";

import { use } from "react";

import { PromotionSlideEditPage } from "@/components/promotions/slides/PromotionSlideEditPage";

export default function EditPromotionSlidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PromotionSlideEditPage slideId={id} />;
}
