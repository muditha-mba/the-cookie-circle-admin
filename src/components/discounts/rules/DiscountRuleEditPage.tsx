"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DiscountRuleForm } from "./DiscountRuleForm";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { PageActions } from "@/components/data/PageActions";
import { discountRulesApi } from "@/lib/api/discount-rules";
import type { DiscountRuleFormValues } from "@/lib/validation/discount-rule";
import { routes } from "@/config/routes";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

type Props = { ruleId: string };

export function DiscountRuleEditPage({ ruleId }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["discount-rule", ruleId],
    queryFn: () => discountRulesApi.get(ruleId),
    enabled: !!ruleId,
  });

  const handleSubmit = async (values: DiscountRuleFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await discountRulesApi.update(ruleId, {
        name: values.name,
        description: values.description,
        config: values.config as Record<string, unknown>,
        priority: values.priority,
        is_active: values.is_active,
      });
      notifyActionSuccess("Changes saved successfully.");
      router.push(routes.discounts.rules.detail(ruleId));
    } catch (err) {
      notifyActionError(err, "Failed to update discount rule.", setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
      return (
      <DashboardPageShell title="Edit Discount Rule">
        <div className="h-64 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Edit Discount Rule">
        <p className="text-sm text-danger">Discount rule could not be loaded.</p>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={`Edit — ${data.name}`}
    >
      <PageActions backHref={routes.discounts.rules.detail(ruleId)} backLabel="Back to rule" className="mb-6" />
      <DiscountRuleForm
        defaultValues={{
          name: data.name,
          description: data.description,
          rule_type: data.rule_type,
          config: {
            ...(data.config as DiscountRuleFormValues["config"]),
            image_url:
              typeof (data.config as Record<string, unknown>).image_url === "string"
                ? ((data.config as Record<string, unknown>).image_url as string)
                : "",
          },
          priority: data.priority,
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
