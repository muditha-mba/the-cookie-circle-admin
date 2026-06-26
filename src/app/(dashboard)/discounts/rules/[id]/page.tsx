"use client";

import { use } from "react";

import { DiscountRuleDetailPage } from "@/components/discounts/rules/DiscountRuleDetailPage";

export default function DiscountRuleDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <DiscountRuleDetailPage ruleId={id} />;
}
