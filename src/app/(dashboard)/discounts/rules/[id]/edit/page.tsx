"use client";

import { use } from "react";

import { DiscountRuleEditPage } from "@/components/discounts/rules/DiscountRuleEditPage";

export default function EditDiscountRulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <DiscountRuleEditPage ruleId={id} />;
}
