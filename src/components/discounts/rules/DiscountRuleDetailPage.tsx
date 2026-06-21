"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { PageActions, PrimaryLink, SecondaryButton } from "@/components/data/PageActions";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { discountRulesApi } from "@/lib/api/discount-rules";
import { formatDateTime } from "@/lib/format";
import { routes } from "@/config/routes";

type Props = { ruleId: string };

export function DiscountRuleDetailPage({ ruleId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirmDelete, deleteDialog } = useConfirmDelete();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["discount-rule", ruleId],
    queryFn: () => discountRulesApi.get(ruleId),
    enabled: !!ruleId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => discountRulesApi.delete(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discount-rules"] });
      router.push(routes.discounts.rules.list);
    },
  });

  if (isLoading) {
    return (
      <DashboardPageShell title="Discount Rule">
        <div className="h-64 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Discount Rule">
        <p className="text-sm text-danger">Discount rule could not be loaded.</p>
      </DashboardPageShell>
    );
  }

  const config = data.config as Record<string, unknown>;

  return (
    <DashboardPageShell
      title={data.name}
      description={data.description ?? undefined}
    >
      {deleteDialog}

      <div className="mb-6 flex items-center gap-2">
        <Link href={routes.discounts.rules.list} className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover">Rules</Link>
        <PrimaryLink href={routes.discounts.rules.edit(ruleId)}>Edit</PrimaryLink>
        <SecondaryButton
          variant="danger"
          disabled={deleteMutation.isPending}
          onClick={() =>
            confirmDelete({
              title: "Delete discount rule",
              message: `Are you sure you want to delete "${data.name}"? Existing grants will not be affected.`,
              onConfirm: () => deleteMutation.mutate(),
            })
          }
        >
          Delete
        </SecondaryButton>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Rule Details</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-text-muted">Type</dt>
              <dd className="mt-1 font-medium capitalize">
                {data.rule_type.replace(/_/g, " ")}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Priority</dt>
              <dd className="mt-1 font-medium">{data.priority}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Status</dt>
              <dd className="mt-1">
                <StatusBadge active={data.is_active} />
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Created</dt>
              <dd className="mt-1">{formatDateTime(data.created_at)}</dd>
            </div>
            <div>
              <dt className="text-text-muted">Updated</dt>
              <dd className="mt-1">{formatDateTime(data.updated_at)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Rule Configuration</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            {config.required_order_count !== undefined && (
              <div>
                <dt className="text-text-muted">Required orders</dt>
                <dd className="mt-1 font-medium">{String(config.required_order_count)}</dd>
              </div>
            )}
            {config.window_days !== undefined && (
              <div>
                <dt className="text-text-muted">Window</dt>
                <dd className="mt-1 font-medium">{String(config.window_days)} days</dd>
              </div>
            )}
            {config.discount_type !== undefined && (
              <div>
                <dt className="text-text-muted">Discount type</dt>
                <dd className="mt-1 font-medium capitalize">{String(config.discount_type)}</dd>
              </div>
            )}
            {config.discount_value !== undefined && (
              <div>
                <dt className="text-text-muted">Discount value</dt>
                <dd className="mt-1 font-medium">
                  {config.discount_type === "percentage"
                    ? `${config.discount_value}%`
                    : `Rs. ${config.discount_value}`}
                </dd>
              </div>
            )}
            {config.grant_expires_days !== undefined && config.grant_expires_days !== null && (
              <div>
                <dt className="text-text-muted">Grant expires</dt>
                <dd className="mt-1 font-medium">{String(config.grant_expires_days)} days</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </DashboardPageShell>
  );
}
