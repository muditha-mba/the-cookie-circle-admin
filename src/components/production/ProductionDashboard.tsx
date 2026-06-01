"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  EmptyState,
  ProductionTabs,
  SectionCard,
  SimpleTable,
  type ProductionTab,
} from "@/components/production/shared";
import { routes } from "@/config/routes";
import type {
  FulfillmentStatusGroup,
  OrderStatus,
  ProductionBatchStatus,
  ProductionSummaryResponse,
  PurchasePlanningStatus,
} from "@/lib/api/production";
import { productionApi } from "@/lib/api/production";
import { formatCurrency, formatQuantity } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PURCHASE_STATUS_LABELS: Record<PurchasePlanningStatus, string> = {
  not_planned: "Not Planned",
  planned: "Planned",
  ordered: "Ordered",
};

const BATCH_STATUS_LABELS: Record<ProductionBatchStatus, string> = {
  draft: "Draft",
  planning: "Planning",
  ready: "Ready",
};

function FulfillmentGroups({ groups }: { groups: FulfillmentStatusGroup[] }) {
  if (groups.length === 0) {
    return <EmptyState message="No orders scheduled for this date." />;
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.status}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            {STATUS_LABELS[group.status]} ({group.orders.length})
          </h3>
          <ul className="mt-2 divide-y divide-border rounded-md border border-border">
            {group.orders.map((order) => (
              <li
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm"
              >
                <div>
                  <Link
                    href={routes.orders.detail(order.id)}
                    className="font-medium text-primary hover:underline"
                  >
                    {order.order_number}
                  </Link>
                  <span className="mx-2 text-text-muted">·</span>
                  <span className="text-text-secondary">{order.customer_name}</span>
                </div>
                <div className="tabular-nums text-text-secondary">
                  {formatCurrency(order.total_revenue_snapshot)} revenue ·{" "}
                  {formatCurrency(order.total_profit_snapshot)} profit
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SummaryTab({
  summary,
  onExport,
  isExporting,
}: {
  summary: ProductionSummaryResponse;
  onExport: () => void;
  isExporting: boolean;
}) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Order summary"
        description="Totals from order financial snapshots. Draft and cancelled orders are excluded from demand calculations."
        actions={
          <button
            type="button"
            disabled={isExporting}
            onClick={onExport}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isExporting ? "Exporting…" : "Export production CSV"}
          </button>
        }
      >
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            ["Orders", summary.order_summary.total_orders],
            ["Customers", summary.order_summary.total_customers],
            ["Products ordered", summary.order_summary.total_products_ordered],
            ["Collections ordered", summary.order_summary.total_collections_ordered],
            ["Revenue", formatCurrency(summary.order_summary.total_revenue)],
            ["Profit", formatCurrency(summary.order_summary.total_profit)],
          ].map(([label, value]) => (
            <div key={String(label)}>
              <dt className="text-xs text-text-secondary">{label}</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-text-primary">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </SectionCard>

      <SectionCard
        title="Product demand"
        description="Required product quantities aggregated from order lines and collection contents."
      >
        <SimpleTable
          headers={["Product", "Quantity"]}
          rows={summary.product_demand.map((line) => [line.product_name, line.quantity])}
        />
      </SectionCard>

      <SectionCard
        title="Fulfillment status"
        description={`${summary.fulfillment.total_orders} orders scheduled for this date, grouped by status.`}
      >
        <FulfillmentGroups groups={summary.fulfillment.groups} />
      </SectionCard>
    </div>
  );
}

export function ProductionDashboard() {
  const queryClient = useQueryClient();
  const [deliveryDate, setDeliveryDate] = useState("");
  const [showDeliveryDayBatchesOnly, setShowDeliveryDayBatchesOnly] = useState(true);
  const [activeTab, setActiveTab] = useState<ProductionTab>("summary");
  const [batchNotes, setBatchNotes] = useState("");

  const batchesQuery = useQuery({
    queryKey: ["production-batches", showDeliveryDayBatchesOnly],
    queryFn: () => productionApi.listBatches(showDeliveryDayBatchesOnly),
  });

  const summaryQuery = useQuery({
    queryKey: ["production-summary", deliveryDate],
    queryFn: () => productionApi.getSummary(deliveryDate),
    enabled: Boolean(deliveryDate),
  });

  const purchasePlanQuery = useQuery({
    queryKey: ["purchase-plan", deliveryDate],
    queryFn: () => productionApi.getPurchasePlan(deliveryDate),
    enabled: Boolean(deliveryDate) && activeTab === "purchase",
  });

  const exportMutation = useMutation({
    mutationFn: () => productionApi.exportCsv(deliveryDate),
  });

  const purchaseExportMutation = useMutation({
    mutationFn: () => productionApi.exportPurchaseCsv(deliveryDate),
  });

  const batchUpdateMutation = useMutation({
    mutationFn: (payload: { batchId: string; status?: ProductionBatchStatus; notes?: string | null }) =>
      productionApi.updatePlanningBatch(payload.batchId, {
        status: payload.status,
        notes: payload.notes,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["purchase-plan", deliveryDate] });
    },
  });

  const purchaseStatusMutation = useMutation({
    mutationFn: (payload: {
      product_item_id: string;
      purchase_status: PurchasePlanningStatus;
    }) =>
      productionApi.updatePurchaseStatus({
        delivery_date: deliveryDate,
        product_item_id: payload.product_item_id,
        purchase_status: payload.purchase_status,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["purchase-plan", deliveryDate] });
    },
  });

  useEffect(() => {
    if (deliveryDate || !batchesQuery.data?.batches.length) {
      return;
    }
    setDeliveryDate(batchesQuery.data.batches[0].delivery_date);
  }, [batchesQuery.data, deliveryDate]);

  useEffect(() => {
    if (purchasePlanQuery.data?.production_batch.notes != null) {
      setBatchNotes(purchasePlanQuery.data.production_batch.notes);
    }
  }, [purchasePlanQuery.data?.production_batch.notes]);

  const selectedBatchLabel = useMemo(() => {
    const match = batchesQuery.data?.batches.find(
      (batch) => batch.delivery_date === deliveryDate,
    );
    return match?.label ?? deliveryDate;
  }, [batchesQuery.data, deliveryDate]);

  const deliveryDayLabel = batchesQuery.data?.delivery_day ?? "delivery day";
  const summary = summaryQuery.data;

  return (
    <div className="space-y-6">
      <SectionCard
        title="Production date"
        description="Select a scheduled delivery date or Saturday batch to plan weekly production."
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1 space-y-2">
            <label
              htmlFor="production-batch"
              className="block text-xs font-medium text-text-secondary"
            >
              Scheduled batch
            </label>
            <select
              id="production-batch"
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
            >
              <option value="">Select a delivery date…</option>
              {batchesQuery.data?.batches.map((batch) => (
                <option key={batch.delivery_date} value={batch.delivery_date}>
                  {batch.label} ({batch.order_count} orders)
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 space-y-2">
            <label
              htmlFor="production-date"
              className="block text-xs font-medium text-text-secondary"
            >
              Or pick a specific date
            </label>
            <input
              id="production-date"
              type="date"
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={showDeliveryDayBatchesOnly}
              onChange={(event) => setShowDeliveryDayBatchesOnly(event.target.checked)}
              className="rounded border-border"
            />
            Only {deliveryDayLabel} batches
          </label>
        </div>

        {deliveryDate ? (
          <p className="mt-3 text-sm text-text-secondary">
            Planning for{" "}
            <span className="font-medium text-text-primary">{selectedBatchLabel}</span>
          </p>
        ) : null}
      </SectionCard>

      {!deliveryDate ? (
        <EmptyState message="Choose a delivery date to load production requirements." />
      ) : summaryQuery.isLoading ? (
        <p className="text-sm text-text-muted">Loading production summary…</p>
      ) : summaryQuery.isError ? (
        <p className="text-sm text-danger">
          Unable to load production summary. Check that products have recipes and collections are
          configured.
        </p>
      ) : summary ? (
        <>
          <ProductionTabs activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === "summary" ? (
            <SummaryTab
              summary={summary}
              onExport={() => exportMutation.mutate()}
              isExporting={exportMutation.isPending}
            />
          ) : null}

          {activeTab === "ingredients" ? (
            <SectionCard
              title="Ingredient requirements"
              description="Calculated from current product recipes and aggregated demand."
            >
              <SimpleTable
                headers={["Ingredient", "Required", "Est. cost"]}
                rows={summary.ingredient_requirements.map((line) => [
                  line.product_item_name,
                  formatQuantity(line.quantity, line.unit),
                  formatCurrency(line.estimated_cost),
                ])}
              />
            </SectionCard>
          ) : null}

          {activeTab === "packaging" ? (
            <SectionCard
              title="Packaging requirements"
              description="Calculated from current collection packaging lines."
            >
              <SimpleTable
                headers={["Item", "Type", "Required", "Est. cost"]}
                rows={summary.packaging_requirements.map((line) => [
                  line.product_item_name,
                  line.item_type_name ?? "—",
                  formatQuantity(line.quantity, line.unit),
                  formatCurrency(line.estimated_cost),
                ])}
              />
            </SectionCard>
          ) : null}

          {activeTab === "purchase" ? (
            <div className="space-y-6">
              {purchasePlanQuery.isLoading ? (
                <p className="text-sm text-text-muted">Loading purchase plan…</p>
              ) : purchasePlanQuery.isError ? (
                <p className="text-sm text-danger">Unable to load purchase plan.</p>
              ) : purchasePlanQuery.data ? (
                <>
                  <SectionCard
                    title="Production batch"
                    description="Save planning work for this delivery date. This does not affect inventory or orders."
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                      <div className="space-y-2">
                        <label
                          htmlFor="batch-status"
                          className="block text-xs font-medium text-text-secondary"
                        >
                          Batch status
                        </label>
                        <select
                          id="batch-status"
                          value={purchasePlanQuery.data.production_batch.status}
                          disabled={batchUpdateMutation.isPending}
                          onChange={(event) =>
                            batchUpdateMutation.mutate({
                              batchId: purchasePlanQuery.data.production_batch.id,
                              status: event.target.value as ProductionBatchStatus,
                            })
                          }
                          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                        >
                          {(Object.keys(BATCH_STATUS_LABELS) as ProductionBatchStatus[]).map(
                            (status) => (
                              <option key={status} value={status}>
                                {BATCH_STATUS_LABELS[status]}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <label
                          htmlFor="batch-notes"
                          className="block text-xs font-medium text-text-secondary"
                        >
                          Notes
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="batch-notes"
                            value={batchNotes}
                            onChange={(event) => setBatchNotes(event.target.value)}
                            className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                            placeholder="Planning notes for staff…"
                          />
                          <button
                            type="button"
                            disabled={batchUpdateMutation.isPending}
                            onClick={() =>
                              batchUpdateMutation.mutate({
                                batchId: purchasePlanQuery.data.production_batch.id,
                                notes: batchNotes || null,
                              })
                            }
                            className="shrink-0 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-surface-hover"
                          >
                            Save notes
                          </button>
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Purchase planning"
                    description="Combined ingredient and packaging demand with primary suppliers. Update status as purchasing progresses."
                    actions={
                      <button
                        type="button"
                        disabled={purchaseExportMutation.isPending}
                        onClick={() => purchaseExportMutation.mutate()}
                        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                      >
                        {purchaseExportMutation.isPending ? "Exporting…" : "Export purchase CSV"}
                      </button>
                    }
                  >
                    <SimpleTable
                      headers={["Item", "Required", "Est. cost", "Supplier", "Status"]}
                      rows={purchasePlanQuery.data.items.map((line) => [
                        line.product_item_name,
                        formatQuantity(line.quantity, line.unit),
                        formatCurrency(line.estimated_cost),
                        line.supplier?.supplier_name ?? (
                          <span className="text-warning">Unassigned</span>
                        ),
                        <select
                          key={`${line.product_item_id}-${line.purchase_status}`}
                          value={line.purchase_status}
                          disabled={purchaseStatusMutation.isPending}
                          onChange={(event) =>
                            purchaseStatusMutation.mutate({
                              product_item_id: line.product_item_id,
                              purchase_status: event.target.value as PurchasePlanningStatus,
                            })
                          }
                          className={cn(
                            "rounded-md border border-border bg-background px-2 py-1 text-xs",
                          )}
                        >
                          {(
                            Object.keys(PURCHASE_STATUS_LABELS) as PurchasePlanningStatus[]
                          ).map((status) => (
                            <option key={status} value={status}>
                              {PURCHASE_STATUS_LABELS[status]}
                            </option>
                          ))}
                        </select>,
                      ])}
                    />
                  </SectionCard>
                </>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
