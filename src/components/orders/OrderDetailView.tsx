"use client";

import Link from "next/link";

import { DeliveryLocationPickerLazy } from "@/components/orders/DeliveryLocationPickerLazy";
import { OrderCollectionLineDetail } from "@/components/orders/OrderCollectionLineDetail";
import { OrderFinancialPerformance } from "@/components/orders/OrderFinancialPerformance";
import { OrderProductFinancialBreakdown } from "@/components/orders/OrderProductFinancialBreakdown";
import { OrderSnapshotIntegrityNotice } from "@/components/orders/OrderSnapshotIntegrityNotice";
import { DetailField } from "@/components/data/DetailField";
import { DetailMetadataCard } from "@/components/data/DetailMetadataCard";
import { EnumStatusBadge } from "@/components/ui/EnumStatusBadge";
import { routes } from "@/config/routes";
import type { OrderDetail } from "@/lib/api/orders";
import { formatCurrency, formatDateTime } from "@/lib/format";

type OrderDetailViewProps = {
  order: OrderDetail;
};

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatAddress(order: OrderDetail) {
  const parts = [
    order.delivery_address_line_1,
    order.delivery_address_line_2,
    order.delivery_city,
    order.delivery_postal_code,
  ].filter(Boolean);
  if (parts.length === 0) {
    return "—";
  }
  return parts.join(", ");
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const lifecycleEntries = [
    { label: "Confirmed", at: order.lifecycle.confirmed_at },
    { label: "Preparing", at: order.lifecycle.preparing_at },
    { label: "Ready", at: order.lifecycle.ready_at },
    { label: "Delivered", at: order.lifecycle.delivered_at },
    { label: "Cancelled", at: order.lifecycle.cancelled_at },
  ].filter((entry) => entry.at);

  return (
    <div className="space-y-8">
      <DetailMetadataCard>
        <DetailField label="Order number" value={order.order_number} />
        <DetailField
          label="Customer"
          value={
            <Link
              href={routes.customers.detail(order.customer.id)}
              className="text-primary hover:underline"
            >
              {order.customer.first_name} {order.customer.last_name}
            </Link>
          }
        />
        <DetailField label="Source" value={formatLabel(order.source)} />
        {order.order_type ? (
          <DetailField label="Order type" value={formatLabel(order.order_type)} />
        ) : null}
        {order.event_name ? (
          <DetailField label="Event name" value={order.event_name} />
        ) : null}
        <DetailField
          label="Order status"
          value={<EnumStatusBadge kind="order" value={order.status} />}
        />
        <DetailField label="Payment method" value={formatLabel(order.payment_method)} />
        <DetailField
          label="Payment status"
          value={<EnumStatusBadge kind="payment" value={order.payment_status} />}
        />
        <DetailField
          label="Delivery area"
          value={
            order.delivery_area ? (
              <Link
                href={routes.deliveryAreas.detail(order.delivery_area.id)}
                className="text-primary hover:underline"
              >
                {order.delivery_area.name}
                {order.delivery_area.pickup_only ? " (pickup)" : ""}
              </Link>
            ) : (
              "—"
            )
          }
        />
        <DetailField
          label="Requested delivery"
          value={new Date(order.requested_delivery_date).toLocaleDateString()}
        />
        <DetailField
          label="Scheduled delivery"
          value={new Date(order.scheduled_delivery_date).toLocaleDateString()}
        />
        <DetailField label="Created" value={formatDateTime(order.created_at)} />
        <DetailField label="Customer notes" value={order.customer_notes || "—"} fullWidth />
        <DetailField label="Internal notes" value={order.internal_notes || "—"} fullWidth />
      </DetailMetadataCard>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Customer profile (defaults)
        </h3>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-secondary">Email</dt>
            <dd className="text-text-primary">{order.customer.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Phone</dt>
            <dd className="text-text-primary">{order.customer.phone ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-text-secondary">Default address</dt>
            <dd className="text-text-primary">
              {[
                order.customer.address_line_1,
                order.customer.address_line_2,
                order.customer.city,
                order.customer.postal_code,
              ]
                .filter(Boolean)
                .join(", ") || "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Delivery information (order snapshot)
        </h3>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-text-secondary">Contact</dt>
            <dd className="text-text-primary">{order.delivery_contact_name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Primary phone</dt>
            <dd className="text-text-primary">{order.delivery_phone_primary ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Secondary phone</dt>
            <dd className="text-text-primary">{order.delivery_phone_secondary ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-text-secondary">Address</dt>
            <dd className="text-text-primary">{formatAddress(order)}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Landmark</dt>
            <dd className="text-text-primary">{order.delivery_landmark ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-text-secondary">Delivery fee (snapshot)</dt>
            <dd className="text-text-primary">
              {formatCurrency(order.financial_performance.snapshot.delivery_fee_snapshot)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-text-secondary">Delivery notes</dt>
            <dd className="text-text-primary">{order.delivery_notes ?? "—"}</dd>
          </div>
        </dl>
        {order.delivery_latitude != null && order.delivery_longitude != null ? (
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-text-secondary">Delivery pin</p>
            <DeliveryLocationPickerLazy
              readOnly
              latitude={String(order.delivery_latitude)}
              longitude={String(order.delivery_longitude)}
              onChange={() => undefined}
            />
          </div>
        ) : null}
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Status timeline
        </h3>
        {order.status_timeline.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">No status history.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {order.status_timeline.map((event) => (
              <li key={event.id} className="flex items-start justify-between gap-4 text-sm">
                <EnumStatusBadge kind="order" value={event.status} />
                <span className="text-text-muted">{formatDateTime(event.created_at)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {lifecycleEntries.length > 0 ? (
        <section className="rounded-lg border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Lifecycle timestamps
          </h3>
          <dl className="mt-4 space-y-2 text-sm">
            {lifecycleEntries.map((entry) => (
              <div key={entry.label} className="flex justify-between gap-4">
                <dt className="text-text-secondary">{entry.label}</dt>
                <dd className="text-text-primary">{formatDateTime(entry.at!)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <OrderFinancialPerformance performance={order.financial_performance} />

      {order.order_type === "catering" && order.product_lines.length > 0 ? (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Catering cookies
          </h3>
          <OrderProductFinancialBreakdown productLines={order.product_lines} />
        </section>
      ) : (
        <OrderProductFinancialBreakdown productLines={order.product_lines} />
      )}

      {order.collection_lines.length > 0 ? (
        <section className="space-y-4">
          {order.order_type === "catering" ? (
            <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
              Collection lines
            </h3>
          ) : null}
          {order.collection_lines.map((line) => (
            <OrderCollectionLineDetail key={line.id} line={line} />
          ))}
        </section>
      ) : null}

      <OrderSnapshotIntegrityNotice />
    </div>
  );
}
