"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DiscountRuleForm } from "./DiscountRuleForm";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { PageActions } from "@/components/data/PageActions";
import Link from "next/link";
import { discountRulesApi } from "@/lib/api/discount-rules";
import type { DiscountRuleFormValues } from "@/lib/validation/discount-rule";
import { routes } from "@/config/routes";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

export function DiscountRuleNewPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: DiscountRuleFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const rule = await discountRulesApi.create({
        name: values.name,
        description: values.description,
        rule_type: values.rule_type,
        config: values.config as Record<string, unknown>,
        priority: values.priority,
        is_active: values.is_active,
      });
      notifyActionSuccess("Discount rule created successfully.");
      router.push(routes.discounts.rules.detail(rule.id));
    } catch (err) {
      notifyActionError(err, "Failed to create discount rule.", setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPageShell
      title="New Discount Rule"
      description="Create a rule that grants discounts to eligible customers."
    >
      <PageActions backHref={routes.discounts.rules.list} backLabel="Back to rules" className="mb-6" />
      <DiscountRuleForm
        submitLabel="Create rule"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
