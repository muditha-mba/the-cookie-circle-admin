"use client";

import Link from "next/link";
import { Factory } from "lucide-react";

import { ANALYTICS_CATEGORY_ACCENT_VAR } from "@/components/analytics/analytics-categories";
import { routes } from "@/config/routes";
import type { UpcomingProductionDemand } from "@/lib/api/analytics";
import { formatDate, formatQuantity } from "@/lib/format";

type UpcomingProductionDemandCardProps = {
  data: UpcomingProductionDemand | undefined;
  isLoading: boolean;
};

function PreviewList({
  title,
  items,
}: {
  title: string;
  items: { item_name: string; quantity: string; unit: string }[];
}) {
  if (items.length === 0) {
    return (
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          {title}
        </h3>
        <p className="mt-2 text-sm text-text-muted">No requirements calculated.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
        {title}
      </h3>
      <ul className="mt-2 divide-y divide-border rounded-md border border-border">
        {items.map((item) => (
          <li
            key={item.item_name}
            className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
          >
            <span className="text-text-primary">{item.item_name}</span>
            <span className="tabular-nums text-text-secondary">
              {formatQuantity(item.quantity, item.unit)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function UpcomingProductionDemandCard({
  data,
  isLoading,
}: UpcomingProductionDemandCardProps) {
  const accent = ANALYTICS_CATEGORY_ACCENT_VAR.production;

  if (isLoading) {
    return (
      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </section>
    );
  }

  if (!data?.has_upcoming_batch || !data.delivery_date) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-surface p-6">
        <div className="flex items-start gap-3">
          <div
            className="rounded-lg p-2.5"
            style={{ backgroundColor: "var(--analytics-production-soft)" }}
          >
            <Factory className="h-5 w-5" style={{ color: accent }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Upcoming production demand
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              No upcoming delivery batches are scheduled. New orders with future delivery dates
              will appear here.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="h-1" style={{ backgroundColor: accent }} aria-hidden />
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="rounded-lg p-2.5"
              style={{ backgroundColor: "var(--analytics-production-soft)" }}
            >
              <Factory className="h-5 w-5" style={{ color: accent }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Upcoming production demand
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Next delivery batch · {formatDate(data.delivery_date)}
              </p>
            </div>
          </div>
          <Link
            href={routes.production}
            className="text-sm font-medium text-primary hover:underline"
          >
            View production planning →
          </Link>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-background/50 px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Orders
            </dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums text-text-primary">
              {data.order_count.toLocaleString("en-LK")}
            </dd>
          </div>
          <div className="rounded-lg border border-border bg-background/50 px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Collections
            </dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums text-text-primary">
              {Number(data.collection_count).toLocaleString("en-LK")}
            </dd>
          </div>
          <div className="rounded-lg border border-border bg-background/50 px-4 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Product units
            </dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums text-text-primary">
              {Number(data.product_count).toLocaleString("en-LK")}
            </dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <PreviewList title="Top ingredients" items={data.top_ingredients} />
          <PreviewList title="Top packaging" items={data.top_packaging} />
        </div>
      </div>
    </section>
  );
}
