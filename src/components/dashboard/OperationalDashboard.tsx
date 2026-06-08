"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BellRing,
  Boxes,
  CalendarClock,
  CircleAlert,
  ClipboardList,
  Plus,
  Truck,
  Users,
} from "lucide-react";

import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { EnumStatusBadge } from "@/components/ui/EnumStatusBadge";
import { routes } from "@/config/routes";
import { dashboardApi } from "@/lib/api/dashboard";
import { formatCount, formatCurrency, formatDate } from "@/lib/format";

function SnapshotCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors hover:bg-surface-elevated">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-text-muted">{label}</p>
        <span className="text-text-muted">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-border/60 pb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-primary">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ActionButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover"
    >
      <span className="text-text-secondary">{icon}</span>
      {label}
    </Link>
  );
}

export function OperationalDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: dashboardApi.getOverview,
  });

  return (
    <DashboardPageShell
      title="Dashboard"
      description="Operational awareness for today and upcoming actions."
    >
      {isError ? (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          Unable to load dashboard data right now.
        </div>
      ) : null}

      <div className="space-y-7">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SnapshotCard
            label="Orders Today"
            icon={<ClipboardList className="h-4 w-4" />}
            value={
              isLoading || !data ? "—" : data.today_snapshot.orders_today.toString()
            }
          />
          <SnapshotCard
            label="Revenue Today"
            icon={<Boxes className="h-4 w-4" />}
            value={
              isLoading || !data
                ? "—"
                : formatCurrency(data.today_snapshot.revenue_today)
            }
          />
          <SnapshotCard
            label="Deliveries Today"
            icon={<Truck className="h-4 w-4" />}
            value={
              isLoading || !data
                ? "—"
                : data.today_snapshot.deliveries_today.toString()
            }
          />
          <SnapshotCard
            label="Production Units Scheduled Today"
            icon={<CalendarClock className="h-4 w-4" />}
            value={
              isLoading || !data
                ? "—"
                : formatCount(data.today_snapshot.production_units_scheduled_today)
            }
          />
        </div>

        <SectionCard
          title="Upcoming Production"
          action={
            <Link
              href={routes.production}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              View Production Planning
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {!data || !data.upcoming_production.has_upcoming_batch ? (
            <p className="text-sm text-text-muted">No upcoming production batch.</p>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border border-border/70 bg-surface-elevated px-3 py-2">
                <p className="text-text-secondary">
                  <span className="font-medium text-text-primary">Next batch:</span>{" "}
                  {data.upcoming_production.delivery_date
                    ? formatDate(data.upcoming_production.delivery_date)
                    : "—"}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border/70 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-text-muted">Orders</p>
                  <p className="mt-1 text-lg font-semibold text-text-primary">
                    {data.upcoming_production.orders}
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-text-muted">Collections</p>
                  <p className="mt-1 text-lg font-semibold text-text-primary">
                    {formatCount(data.upcoming_production.collections)}
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 px-3 py-2">
                  <p className="text-xs uppercase tracking-wide text-text-muted">Product Units</p>
                  <p className="mt-1 text-lg font-semibold text-text-primary">
                    {formatCount(data.upcoming_production.product_units)}
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-text-muted">
                  Top ingredients
                </p>
                {data.upcoming_production.top_ingredients.length === 0 ? (
                  <p className="text-sm text-text-muted">
                    No ingredient requirements available.
                  </p>
                ) : (
                  <ul className="grid gap-2 sm:grid-cols-3">
                    {data.upcoming_production.top_ingredients.map((item) => (
                      <li
                        key={item}
                        className="rounded-md border border-border/70 bg-surface-elevated px-3 py-2 text-text-secondary"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </SectionCard>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Dashboard Drilldowns
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={routes.analytics.revenue}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-primary hover:bg-surface-hover"
            >
              Revenue
            </Link>
            <Link
              href={routes.analytics.products}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-primary hover:bg-surface-hover"
            >
              Products
            </Link>
            <Link
              href={routes.analytics.collections}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-primary hover:bg-surface-hover"
            >
              Collections
            </Link>
            <Link
              href={routes.analytics.customers}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-primary hover:bg-surface-hover"
            >
              Customers
            </Link>
            <Link
              href={routes.analytics.orders}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-primary hover:bg-surface-hover"
            >
              Orders
            </Link>
            <Link
              href={routes.analytics.production}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-primary hover:bg-surface-hover"
            >
              Production
            </Link>
            <Link
              href={routes.analytics.operations}
              className="rounded-md border border-border px-3 py-1.5 text-sm text-primary hover:bg-surface-hover"
            >
              Operations
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Upcoming Deliveries"
            action={
              <Link
                href={routes.orders.list}
                className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
              >
                View Orders
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            {!data || data.upcoming_deliveries.length === 0 ? (
              <p className="text-sm text-text-muted">
                No upcoming deliveries scheduled.
              </p>
            ) : (
              <div className="space-y-2">
                {data.upcoming_deliveries.map((row) => (
                  <div
                    key={row.delivery_date}
                    className="flex items-center justify-between rounded-lg border border-border/70 bg-surface-elevated px-3 py-2.5 text-sm"
                  >
                    <span className="text-text-secondary">
                      {formatDate(row.delivery_date)}
                    </span>
                    <span className="font-semibold text-text-primary">
                      {row.order_count} orders
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Operational Alerts">
            {!data || data.operational_alerts.length === 0 ? (
              <p className="text-sm text-text-muted">No active alerts right now.</p>
            ) : (
              <div className="space-y-2">
                {data.operational_alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2.5"
                  >
                    <div className="flex items-start gap-2">
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {alert.title} ({alert.count})
                        </p>
                        <p className="text-xs text-text-secondary">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="Recent Orders"
          action={
            <Link
              href={routes.orders.list}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              View All Orders
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {!data || data.recent_orders.length === 0 ? (
            <p className="text-sm text-text-muted">No recent orders found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead>
                  <tr className="text-left text-text-muted">
                    <th className="py-2 pr-4 font-medium">Order</th>
                    <th className="py-2 pr-4 font-medium">Customer</th>
                    <th className="py-2 pr-4 font-medium">Delivery Date</th>
                    <th className="py-2 pr-4 font-medium">Total</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {data.recent_orders.map((order) => (
                    <tr
                      key={order.order_id}
                      className="transition-colors hover:bg-surface-elevated/60"
                    >
                      <td className="py-2.5 pr-4">
                        <Link
                          className="font-medium text-brand hover:underline"
                          href={routes.orders.detail(order.order_id)}
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4">
                        <Link
                          className="text-text-secondary hover:text-brand"
                          href={routes.customers.detail(order.customer_id)}
                        >
                          {order.customer_name}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-text-secondary">
                        {formatDate(order.delivery_date)}
                      </td>
                      <td className="py-2.5 pr-4 font-medium text-text-primary">
                        {formatCurrency(order.total_revenue_snapshot)}
                      </td>
                      <td className="py-2.5">
                        <EnumStatusBadge kind="order" value={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard title="Quick Actions">
            <div className="flex flex-wrap gap-3">
              <ActionButton
                href={routes.orders.create}
                icon={<Plus className="h-4 w-4" />}
                label="Create Order"
              />
              <ActionButton
                href={routes.customers.create}
                icon={<Users className="h-4 w-4" />}
                label="Create Customer"
              />
              <ActionButton
                href={routes.production}
                icon={<Boxes className="h-4 w-4" />}
                label="View Production"
              />
              <ActionButton
                href={routes.analytics.home}
                icon={<BellRing className="h-4 w-4" />}
                label="View Analytics"
              />
            </div>
          </SectionCard>

          <SectionCard title="Inventory Monitoring">
            <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
              <p className="text-sm font-medium text-text-primary">Coming in Phase 8 Inventory</p>
              <p className="mt-1 text-xs text-text-muted">
                Stock visibility and monitoring will be added in the next phase.
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardPageShell>
  );
}
