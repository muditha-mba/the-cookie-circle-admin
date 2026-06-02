"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Factory,
  Gauge,
  Layers,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { routes } from "@/config/routes";
import { analyticsApi } from "@/lib/api/analytics";
import { cn } from "@/lib/utils";

const CATEGORY_HREFS: Partial<Record<string, string>> = {
  revenue: routes.analytics.revenue,
  products: routes.analytics.products,
  customers: routes.analytics.customers,
  production: routes.analytics.production,
  collections: routes.analytics.collections,
  orders: routes.analytics.orders,
  operations: routes.analytics.operations,
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  revenue: TrendingUp,
  orders: ShoppingCart,
  products: Package,
  collections: Layers,
  customers: Users,
  production: Factory,
  operations: Gauge,
};

function formatPresetLabel(preset: string | null) {
  if (!preset) return "Custom range";
  return preset.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AnalyticsLanding() {
  const overviewQuery = useQuery({
    queryKey: ["analytics-overview", "last_30_days"],
    queryFn: () => analyticsApi.getOverview({ preset: "last_30_days" }),
  });

  const overview = overviewQuery.data;

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-border bg-surface p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-lg border border-border bg-background p-3">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">Analytics foundation</h2>
            <p className="mt-2 max-w-2xl text-sm text-text-secondary">
              Reusable metrics and API endpoints are ready for future dashboards. This page
              shows category navigation only — charts and full reports
              will be added in a later phase.
            </p>
            {overview ? (
              <p className="mt-3 text-xs text-text-muted">
                Default preview range: {formatPresetLabel(overview.date_range.preset)} (
                {overview.date_range.start_date} → {overview.date_range.end_date})
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Analytics categories
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Dashboards for each area will connect to the analytics API services below.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {overview?.categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.id] ?? BarChart3;
            const href = CATEGORY_HREFS[category.id];
            const card = (
              <article
                className={cn(
                  "rounded-lg border border-border bg-surface p-5",
                  href && "transition-colors hover:border-primary/40",
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-medium text-text-primary">{category.title}</h3>
                    <p className="mt-2 text-sm text-text-secondary">{category.description}</p>
                    {href ? (
                      <span className="mt-3 inline-block text-sm font-medium text-primary">
                        Open dashboard →
                      </span>
                    ) : (
                      <span className="mt-3 inline-block rounded-full border border-border bg-background px-2 py-0.5 text-xs text-text-muted">
                        Dashboard coming soon
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );

            return href ? (
              <Link key={category.id} href={href} className="block">
                {card}
              </Link>
            ) : (
              <div key={category.id}>{card}</div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
