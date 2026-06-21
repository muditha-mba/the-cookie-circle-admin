"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { CustomerSegmentBadge } from "@/components/customers/CustomerSegmentBadge";
import { DetailField } from "@/components/data/DetailField";
import { DetailMetadataCard } from "@/components/data/DetailMetadataCard";
import { PageActions, PrimaryLink } from "@/components/data/PageActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import type {
  CommunicationType,
  CustomerDetail,
  CustomerInsights,
} from "@/lib/api/customers";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { customersApi } from "@/lib/api/customers";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { formatMarketingSourceLabel } from "@/lib/marketing-sources";
import { cn } from "@/lib/utils";

type Tab = "overview" | "insights" | "notes" | "communications" | "orders";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "insights", label: "Insights" },
  { id: "notes", label: "Notes" },
  { id: "communications", label: "Communications" },
  { id: "orders", label: "Order History" },
];

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function InsightsPanel({
  insights,
  canViewFinancials,
}: {
  insights: CustomerInsights;
  canViewFinancials: boolean;
}) {
  return (
    <DetailMetadataCard>
      <DetailField label="Segment" value={<CustomerSegmentBadge segment={insights.segment} />} />
      <DetailField
        label="Marketing source"
        value={formatMarketingSourceLabel(insights.marketing_source)}
      />
      {canViewFinancials ? (
        <>
          <DetailField label="Lifetime spend" value={formatCurrency(insights.lifetime_spend)} />
          <DetailField
            label="Average order value"
            value={formatCurrency(insights.average_order_value)}
          />
        </>
      ) : null}
      <DetailField label="Total orders" value={insights.total_orders} />
      <DetailField
        label="Last order"
        value={
          insights.last_order_date
            ? new Date(insights.last_order_date).toLocaleDateString()
            : "—"
        }
      />
      <DetailField
        label="First order"
        value={
          insights.first_order_date
            ? new Date(insights.first_order_date).toLocaleDateString()
            : "—"
        }
      />
      <DetailField label="Favourite product" value={insights.favourite_product ?? "—"} />
      <DetailField label="Favourite collection" value={insights.favourite_collection ?? "—"} />
    </DetailMetadataCard>
  );
}

function OverviewPanel({
  customer,
  insights,
  canViewFinancials,
}: {
  customer: CustomerDetail;
  insights: CustomerInsights | undefined;
  canViewFinancials: boolean;
}) {
  const summaryCards = insights
    ? [
        ...(canViewFinancials
          ? [["Lifetime spend", formatCurrency(insights.lifetime_spend)] as const]
          : []),
        ["Orders", insights.total_orders] as const,
        ["Segment", <CustomerSegmentBadge key="seg" segment={insights.segment} />] as const,
        [
          "Last order",
          insights.last_order_date
            ? new Date(insights.last_order_date).toLocaleDateString()
            : "—",
        ] as const,
      ]
    : [];

  return (
    <>
      {insights ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-lg border border-border bg-surface px-4 py-3"
            >
              <p className="text-xs text-text-secondary">{label}</p>
              <p className="mt-1 text-lg font-semibold text-text-primary">{value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <DetailMetadataCard>
        <DetailField label="Status" value={<StatusBadge active={customer.is_active} />} />
        <DetailField label="Record source" value={formatLabel(customer.source)} />
        <DetailField
          label="Marketing source"
          value={formatMarketingSourceLabel(customer.marketing_source)}
        />
        {customer.marketing_attribution ? (
          <DetailField
            label="Attribution details"
            value={
              <div className="space-y-1 text-sm text-text-primary">
                {customer.marketing_attribution.utm_campaign ? (
                  <p>
                    Campaign:{" "}
                    <span className="font-medium">
                      {customer.marketing_attribution.utm_campaign}
                    </span>
                  </p>
                ) : null}
                {customer.marketing_attribution.utm_medium ? (
                  <p>Medium: {customer.marketing_attribution.utm_medium}</p>
                ) : null}
                {customer.marketing_attribution.landing_path ? (
                  <p className="font-mono text-xs">
                    Landing: {customer.marketing_attribution.landing_path}
                  </p>
                ) : null}
                {customer.marketing_attribution.referrer ? (
                  <p className="break-all font-mono text-xs">
                    Referrer: {customer.marketing_attribution.referrer}
                  </p>
                ) : null}
              </div>
            }
            fullWidth
          />
        ) : null}
        <DetailField label="Email" value={customer.email ?? "—"} />
        <DetailField label="Phone" value={customer.phone ?? "—"} />
        <DetailField
          label="Address"
          value={
            [customer.address_line_1, customer.address_line_2, customer.city, customer.postal_code]
              .filter(Boolean)
              .join(", ") || "—"
          }
          fullWidth
        />
        <DetailField label="Landmark" value={customer.landmark ?? "—"} />
        <DetailField label="Profile notes" value={customer.notes || "—"} fullWidth />
        {customer.user ? (
          <DetailField label="Linked user" value={customer.user.email} />
        ) : null}
      </DetailMetadataCard>
    </>
  );
}

function NotesPanel({ customerId }: { customerId: string }) {
  const queryClient = useQueryClient();
  const { confirmDelete, deleteDialog } = useConfirmDelete();
  const [note, setNote] = useState("");

  const notesQuery = useQuery({
    queryKey: ["customer-notes", customerId],
    queryFn: () => customersApi.listNotes(customerId),
  });

  const createMutation = useMutation({
    meta: { successMessage: "Note added successfully." },
    mutationFn: () => customersApi.createNote(customerId, note),
    onSuccess: () => {
      setNote("");
      void queryClient.invalidateQueries({ queryKey: ["customer-notes", customerId] });
    },
  });

  const deleteMutation = useMutation({
    meta: { successMessage: "Note deleted successfully." },
    mutationFn: (noteId: string) => customersApi.deleteNote(customerId, noteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customer-notes", customerId] });
    },
  });

  return (
    <div className="space-y-6">
      {deleteDialog}
      <form
        className="rounded-lg border border-border bg-surface p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (note.trim()) createMutation.mutate();
        }}
      >
        <label htmlFor="new-note" className="block text-xs font-medium text-text-secondary">
          Add internal note
        </label>
        <textarea
          id="new-note"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={createMutation.isPending || !note.trim()}
          className="mt-3 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {createMutation.isPending ? "Saving…" : "Add note"}
        </button>
      </form>

      {notesQuery.isLoading ? (
        <p className="text-sm text-text-muted">Loading notes…</p>
      ) : notesQuery.data?.length ? (
        <ul className="space-y-3">
          {notesQuery.data.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm text-text-primary whitespace-pre-wrap">{entry.note}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
                <span>
                  {entry.created_by.display_name} · {formatDateTime(entry.created_at)}
                </span>
                <button
                  type="button"
                  className="text-danger hover:underline"
                  onClick={() =>
                    confirmDelete({
                      message:
                        "Are you sure you want to delete this note? This action cannot be undone.",
                      onConfirm: () => deleteMutation.mutate(entry.id),
                    })
                  }
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-muted">No notes yet.</p>
      )}
    </div>
  );
}

function CommunicationsPanel({ customerId }: { customerId: string }) {
  const queryClient = useQueryClient();
  const [communicationType, setCommunicationType] = useState<CommunicationType>("phone_call");
  const [note, setNote] = useState("");

  const commsQuery = useQuery({
    queryKey: ["customer-communications", customerId],
    queryFn: () => customersApi.listCommunications(customerId),
  });

  const createMutation = useMutation({
    meta: { successMessage: "Communication logged successfully." },
    mutationFn: () =>
      customersApi.createCommunication(customerId, {
        communication_type: communicationType,
        note,
      }),
    onSuccess: () => {
      setNote("");
      void queryClient.invalidateQueries({
        queryKey: ["customer-communications", customerId],
      });
    },
  });

  return (
    <div className="space-y-6">
      <form
        className="rounded-lg border border-border bg-surface p-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (note.trim()) createMutation.mutate();
        }}
      >
        <div>
          <label htmlFor="comm-type" className="block text-xs font-medium text-text-secondary">
            Type
          </label>
          <select
            id="comm-type"
            value={communicationType}
            onChange={(event) =>
              setCommunicationType(event.target.value as CommunicationType)
            }
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="phone_call">Phone Call</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="manual_follow_up">Manual Follow-up</option>
          </select>
        </div>
        <div>
          <label htmlFor="comm-note" className="block text-xs font-medium text-text-secondary">
            Note
          </label>
          <textarea
            id="comm-note"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={createMutation.isPending || !note.trim()}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {createMutation.isPending ? "Saving…" : "Log communication"}
        </button>
      </form>

      {commsQuery.isLoading ? (
        <p className="text-sm text-text-muted">Loading communications…</p>
      ) : commsQuery.data?.length ? (
        <ul className="space-y-3">
          {commsQuery.data.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {formatLabel(entry.communication_type)}
              </p>
              <p className="mt-2 text-sm text-text-primary whitespace-pre-wrap">{entry.note}</p>
              <p className="mt-3 text-xs text-text-muted">
                {entry.created_by.display_name} · {formatDateTime(entry.created_at)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-text-muted">No communications logged yet.</p>
      )}
    </div>
  );
}

function OrdersPanel({ customerId }: { customerId: string }) {
  const ordersQuery = useQuery({
    queryKey: ["customer-orders", customerId],
    queryFn: () => customersApi.getOrderHistory(customerId),
  });

  if (ordersQuery.isLoading) {
    return <p className="text-sm text-text-muted">Loading orders…</p>;
  }

  if (!ordersQuery.data?.length) {
    return <p className="text-sm text-text-muted">No orders for this customer.</p>;
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {ordersQuery.data.map((order) => (
        <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div>
            <Link
              href={routes.orders.detail(order.id)}
              className="font-medium text-primary hover:underline"
            >
              {order.order_number}
            </Link>
            <span className="mx-2 text-text-muted">·</span>
            <span className="text-sm text-text-secondary">
              {new Date(order.scheduled_delivery_date).toLocaleDateString()} ·{" "}
              {formatLabel(order.status)}
            </span>
          </div>
          <span className="text-sm tabular-nums text-text-secondary">
            {formatCurrency(order.total_revenue_snapshot)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function CustomerDetailView({ customer }: { customer: CustomerDetail }) {
  const { canViewFinancials } = useAdminPermissions();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const visibleTabs = TABS.filter((tab) => canViewFinancials || tab.id !== "insights");

  const insightsQuery = useQuery({
    queryKey: ["customer-insights", customer.id],
    queryFn: () => customersApi.getInsights(customer.id),
  });

  return (
    <>
      <PageActions backHref={routes.customers.list} className="mb-6">
        <PrimaryLink href={routes.customers.edit(customer.id)}>Edit</PrimaryLink>
      </PageActions>

      <nav className="mb-6 flex flex-wrap gap-1 rounded-lg border border-border bg-background p-1">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-surface text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" ? (
        <OverviewPanel
          customer={customer}
          insights={insightsQuery.data}
          canViewFinancials={canViewFinancials}
        />
      ) : null}
      {activeTab === "insights" ? (
        insightsQuery.isLoading ? (
          <p className="text-sm text-text-muted">Loading insights…</p>
        ) : insightsQuery.data ? (
          <InsightsPanel
            insights={insightsQuery.data}
            canViewFinancials={canViewFinancials}
          />
        ) : (
          <p className="text-sm text-danger">Unable to load insights.</p>
        )
      ) : null}
      {activeTab === "notes" ? <NotesPanel customerId={customer.id} /> : null}
      {activeTab === "communications" ? (
        <CommunicationsPanel customerId={customer.id} />
      ) : null}
      {activeTab === "orders" ? <OrdersPanel customerId={customer.id} /> : null}
    </>
  );
}
