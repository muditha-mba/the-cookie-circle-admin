"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { routes } from "@/config/routes";
import { inventoryApi } from "@/lib/api/inventory";
import { formatDate } from "@/lib/format";

function AlertLink({
  href,
  title,
  count,
  description,
  tone = "default",
}: {
  href: string;
  title: string;
  count: number;
  description: string;
  tone?: "default" | "warning";
}) {
  if (count <= 0) {
    return null;
  }

  return (
    <Link
      href={href}
      className={
        tone === "warning"
          ? "block rounded-lg border border-warning/30 bg-warning/10 px-3 py-2.5 transition-colors hover:bg-warning/15"
          : "block rounded-lg border border-border/70 bg-surface-elevated px-3 py-2.5 transition-colors hover:bg-surface-hover"
      }
    >
      <p className="text-sm font-medium text-text-primary">
        {title} <span className="tabular-nums">({count})</span>
      </p>
      <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
    </Link>
  );
}

export function InventoryMonitoringSection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["inventory-alerts"],
    queryFn: () => inventoryApi.getAlerts(),
  });

  if (isLoading) {
    return <p className="text-sm text-text-muted">Loading inventory alerts…</p>;
  }

  if (isError) {
    return <p className="text-sm text-danger">Unable to load inventory alerts.</p>;
  }

  const hasAlerts =
    (data?.low_stock_count ?? 0) > 0 ||
    (data?.expiring_soon_count ?? 0) > 0 ||
    (data?.pending_consumption_count ?? 0) > 0 ||
    (data?.upcoming_shortfall_count ?? 0) > 0;

  if (!hasAlerts) {
    return (
      <p className="text-sm text-text-muted">
        No inventory alerts right now. Stock levels and upcoming production demand look healthy.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <AlertLink
        href={`${routes.inventory.overview}?low_stock=1`}
        title="Low stock items"
        count={data?.low_stock_count ?? 0}
        description="Tracked items at or below reorder level."
        tone="warning"
      />
      <AlertLink
        href={routes.inventory.lots}
        title="Lots expiring soon"
        count={data?.expiring_soon_count ?? 0}
        description="Active lots expiring within 7 days."
        tone="warning"
      />
      <AlertLink
        href={routes.inventory.consumption.list}
        title="Stock reviews pending"
        count={data?.pending_consumption_count ?? 0}
        description="Delivered orders awaiting consumption approval."
        tone="warning"
      />
      <AlertLink
        href={routes.production}
        title="Upcoming production shortfalls"
        count={data?.upcoming_shortfall_count ?? 0}
        description={
          data?.upcoming_shortfall_delivery_date
            ? `Tracked items short for ${formatDate(data.upcoming_shortfall_delivery_date)}.`
            : "Tracked items short for the next production batch."
        }
        tone="warning"
      />
    </div>
  );
}
