"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { DetailField } from "@/components/data/DetailField";
import { DetailMetadataCard } from "@/components/data/DetailMetadataCard";
import { PageActions, SecondaryButton } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import type { ConsumptionProposalLine } from "@/lib/api/consumption-proposals";
import { consumptionProposalsApi } from "@/lib/api/consumption-proposals";
import { formatDate, formatDateTime, formatQuantity } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api/error-message";

type ConsumptionProposalDetailProps = {
  proposalId: string;
};

function demandTypeLabel(value: ConsumptionProposalLine["demand_type"]) {
  return value === "ingredient" ? "Ingredient" : "Packaging";
}

export function ConsumptionProposalDetail({ proposalId }: ConsumptionProposalDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");
  const [lineQuantities, setLineQuantities] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["consumption-proposals", proposalId],
    queryFn: () => consumptionProposalsApi.get(proposalId),
    enabled: Boolean(proposalId),
  });

  useEffect(() => {
    if (!data) {
      return;
    }
    setNotes(data.notes ?? "");
    const next: Record<string, string> = {};
    for (const line of data.lines) {
      next[line.id] = String(line.quantity_approved ?? line.quantity_proposed);
    }
    setLineQuantities(next);
  }, [data]);

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["consumption-proposals"] }),
      queryClient.invalidateQueries({ queryKey: ["inventory-balances"] }),
      queryClient.invalidateQueries({ queryKey: ["inventory-lots"] }),
      queryClient.invalidateQueries({ queryKey: ["inventory-movements"] }),
      queryClient.invalidateQueries({ queryKey: ["inventory-alerts"] }),
    ]);
  };

  const saveMutation = useMutation({
    meta: { successMessage: "Changes saved successfully." },
    mutationFn: () =>
      consumptionProposalsApi.update(proposalId, {
        notes: notes || null,
        lines: data?.lines.map((line) => ({
          id: line.id,
          quantity_approved: Number(lineQuantities[line.id] ?? line.quantity_proposed),
        })),
      }),
    onSuccess: async () => {
      await invalidateAll();
      await queryClient.invalidateQueries({ queryKey: ["consumption-proposals", proposalId] });
    },
  });

  const approveMutation = useMutation({
    meta: { successMessage: "Proposal approved successfully." },
    mutationFn: async () => {
      await consumptionProposalsApi.update(proposalId, {
        notes: notes || null,
        lines: data?.lines.map((line) => ({
          id: line.id,
          quantity_approved: Number(lineQuantities[line.id] ?? line.quantity_proposed),
        })),
      });
      return consumptionProposalsApi.approve(proposalId);
    },
    onSuccess: async () => {
      await invalidateAll();
      await queryClient.invalidateQueries({ queryKey: ["consumption-proposals", proposalId] });
    },
  });

  const dismissMutation = useMutation({
    meta: { successMessage: "Proposal dismissed successfully." },
    mutationFn: () => consumptionProposalsApi.dismiss(proposalId),
    onSuccess: async () => {
      await invalidateAll();
      router.push(routes.inventory.consumption.list);
    },
  });

  const isPending = data?.status === "pending_review";
  const isBusy =
    saveMutation.isPending || approveMutation.isPending || dismissMutation.isPending;

  const shortfallLines = useMemo(
    () => data?.lines.filter((line) => line.has_shortfall) ?? [],
    [data?.lines],
  );

  const handleAction = async (action: "save" | "approve" | "dismiss") => {
    setActionError(null);
    try {
      if (action === "save") {
        await saveMutation.mutateAsync();
      } else if (action === "approve") {
        await approveMutation.mutateAsync();
      } else {
        await dismissMutation.mutateAsync();
      }
    } catch (err) {
      setActionError(getErrorMessage(err, "Unable to complete this action."));
    }
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Stock Review" description="Loading...">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Stock Review" description="Not found">
        <p className="text-sm text-danger">Stock review not found.</p>
        <PageActions backHref={routes.inventory.consumption.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={`Stock review · ${formatDate(data.delivery_date)}`}
      description={`${data.order_count} delivered order${data.order_count === 1 ? "" : "s"} · ${data.line_count} line${data.line_count === 1 ? "" : "s"}`}
    >
      <PageActions backHref={routes.inventory.consumption.list} className="mb-6">
        {isPending ? (
          <>
            <SecondaryButton onClick={() => void handleAction("save")} disabled={isBusy}>
              {saveMutation.isPending ? "Saving..." : "Save changes"}
            </SecondaryButton>
            <SecondaryButton onClick={() => void handleAction("approve")} disabled={isBusy}>
              {approveMutation.isPending ? "Applying..." : "Approve & deduct stock"}
            </SecondaryButton>
            <SecondaryButton
              variant="danger"
              onClick={() => void handleAction("dismiss")}
              disabled={isBusy}
            >
              {dismissMutation.isPending ? "Dismissing..." : "Dismiss"}
            </SecondaryButton>
          </>
        ) : null}
      </PageActions>

      {actionError ? <p className="mb-4 text-sm text-danger">{actionError}</p> : null}

      {data.has_shortfall && isPending ? (
        <div className="mb-6 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3">
          <p className="text-sm font-medium text-warning">Insufficient stock for some items</p>
          <p className="mt-1 text-sm text-text-secondary">
            {shortfallLines.length} line{shortfallLines.length === 1 ? "" : "s"} would leave
            negative balances. Receive stock or reduce approved quantities before approving.
          </p>
        </div>
      ) : null}

      <DetailMetadataCard>
        <DetailField
          label="Status"
          value={
            data.status === "pending_review"
              ? "Pending review"
              : data.status === "approved"
                ? "Approved"
                : "Dismissed"
          }
        />
        <DetailField label="Delivery date" value={formatDate(data.delivery_date)} />
        <DetailField
          label="Applied"
          value={data.applied_at ? formatDateTime(data.applied_at) : "—"}
        />
        <DetailField
          label="Reviewed"
          value={data.reviewed_at ? formatDateTime(data.reviewed_at) : "—"}
        />
        <DetailField
          label="Notes"
          value={
            isPending ? (
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Optional review notes…"
              />
            ) : (
              data.notes || "—"
            )
          }
          fullWidth
        />
      </DetailMetadataCard>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-medium text-text-primary">Delivered orders</h2>
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
          {data.orders.map((order) => (
            <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <div>
                <Link href={routes.orders.detail(order.id)} className="font-medium text-primary hover:underline">
                  {order.order_number}
                </Link>
                <span className="mx-2 text-text-muted">·</span>
                <span className="text-text-secondary">{order.customer_name}</span>
              </div>
              {order.delivered_at ? (
                <span className="text-text-muted">{formatDateTime(order.delivered_at)}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-medium text-text-primary">Proposed deductions</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-surface-hover">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Item</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Proposed</th>
                <th className="px-4 py-3 text-left font-medium">Approve qty</th>
                <th className="px-4 py-3 text-left font-medium">On hand</th>
                <th className="px-4 py-3 text-left font-medium">After</th>
                <th className="px-4 py-3 text-left font-medium">Lots (FEFO)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {data.lines.map((line) => (
                <tr
                  key={line.id}
                  className={cn(line.has_shortfall && isPending && "bg-warning/5")}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{line.product_item_name}</div>
                    {!line.track_inventory ? (
                      <p className="mt-0.5 text-xs text-text-muted">Not tracked — skipped on apply</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{demandTypeLabel(line.demand_type)}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatQuantity(line.quantity_proposed, line.unit)}
                  </td>
                  <td className="px-4 py-3">
                    {isPending && line.track_inventory ? (
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={lineQuantities[line.id] ?? ""}
                        onChange={(event) =>
                          setLineQuantities((current) => ({
                            ...current,
                            [line.id]: event.target.value,
                          }))
                        }
                        className="w-28 rounded-md border border-border bg-background px-2 py-1 text-sm tabular-nums"
                      />
                    ) : (
                      <span className="tabular-nums">
                        {formatQuantity(line.effective_quantity, line.unit)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatQuantity(line.quantity_on_hand_snapshot, line.unit)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    <span className={line.has_shortfall && isPending ? "text-warning" : undefined}>
                      {formatQuantity(line.quantity_after, line.unit)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {line.lot_allocations.length === 0 ? (
                      <span className="text-text-muted">—</span>
                    ) : (
                      <ul className="space-y-1 text-xs text-text-secondary">
                        {line.lot_allocations.map((allocation) => (
                          <li key={allocation.id}>
                            {allocation.lot_code}:{" "}
                            {formatQuantity(allocation.quantity, allocation.unit)}
                            {allocation.expires_at
                              ? ` · exp ${formatDate(allocation.expires_at)}`
                              : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardPageShell>
  );
}
