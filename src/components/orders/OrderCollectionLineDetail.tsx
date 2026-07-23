"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import type { OrderCollectionLine, OrderCollectionLineSelection } from "@/lib/api/orders";
import { formatCollectionDisplayName } from "@/lib/collection-display-name";
import { formatCurrency, formatPercent } from "@/lib/format";
import { formatQuantityDisplay, marginToneClass, parseAmount } from "@/lib/orders/financial-display";
import { cn } from "@/lib/utils";

type OrderCollectionLineDetailProps = {
  line: OrderCollectionLine;
};

const tableHeadClass = "border-b border-border text-text-secondary";
const tableThClass = "pb-2 pr-3 font-medium whitespace-nowrap";
const tableRowClass = "border-b border-border/60 last:border-0";
const tableTdClass = "py-2.5 pr-3";

type CookieInsight = {
  label: string;
  name: string;
  value: number;
};

function hasFinancialSnapshots(selections: OrderCollectionLineSelection[]): boolean {
  return selections.some(
    (selection) =>
      selection.product_selling_price_snapshot != null &&
      selection.product_cost_snapshot != null,
  );
}

function buildInsights(selections: OrderCollectionLineSelection[]): CookieInsight[] {
  const rows = selections
    .map((selection) => ({
      name: selection.product_name_snapshot,
      revenue: parseAmount(selection.line_revenue_snapshot) ?? 0,
      profit: parseAmount(selection.line_profit_snapshot) ?? 0,
      margin: parseAmount(selection.margin_percentage_snapshot) ?? 0,
    }))
    .filter((row) => row.revenue > 0 || row.profit > 0);

  if (rows.length === 0) {
    return [];
  }

  const pickHighest = (
    label: string,
    selector: (row: (typeof rows)[number]) => number,
  ) => {
    const best = [...rows].sort((a, b) => selector(b) - selector(a))[0];
    return { label, name: best.name, value: selector(best) };
  };

  const pickLowest = (
    label: string,
    selector: (row: (typeof rows)[number]) => number,
  ) => {
    const best = [...rows].sort((a, b) => selector(a) - selector(b))[0];
    return { label, name: best.name, value: selector(best) };
  };

  return [
    pickHighest("Highest revenue cookie", (row) => row.revenue),
    pickHighest("Highest profit cookie", (row) => row.profit),
    pickHighest("Highest margin cookie", (row) => row.margin),
    pickLowest("Lowest margin cookie", (row) => row.margin),
  ];
}

function SectionCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border/70 bg-surface-hover/20 p-4", className)}>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{title}</h4>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function OrderCollectionLineDetail({ line }: OrderCollectionLineDetailProps) {
  const { canViewFinancials } = useAdminPermissions();
  const [compositionOpen, setCompositionOpen] = useState(true);
  const selections = line.selections ?? [];
  const packQty = parseAmount(line.quantity) ?? 1;
  const financialReady = hasFinancialSnapshots(selections);
  const insights = financialReady ? buildInsights(selections) : [];
  const totalCookies =
    parseAmount(line.total_cookies_per_pack) ??
    selections.reduce((sum, row) => sum + (parseAmount(row.quantity) ?? 0), 0);

  const packRevenue = parseAmount(line.collection_selling_price_snapshot) ?? 0;
  const packCost = parseAmount(line.collection_cost_snapshot) ?? 0;
  const packProfit = parseAmount(line.collection_profit_snapshot) ?? 0;
  const packMargin = parseAmount(line.margin_percentage_snapshot) ?? 0;

  const displayName = formatCollectionDisplayName(line.collection_name_snapshot);
  const lineTitle =
    totalCookies > 0
      ? `${displayName} (${formatQuantityDisplay(totalCookies)} cookies)`
      : displayName;

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Collection line
          </h3>
          <p className="mt-1 text-base font-medium text-text-primary">{lineTitle}</p>
          <p className="mt-1 text-xs text-text-muted">
            Order quantity: {formatQuantityDisplay(line.quantity)} collection
            {packQty === 1 ? "" : "s"}
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="text-text-secondary">Line revenue</p>
          <p className="tabular-nums font-medium text-text-primary">
            {formatCurrency(line.line_revenue_snapshot)}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border/70">
        <button
          type="button"
          onClick={() => setCompositionOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span className="text-sm font-medium text-text-primary">Collection composition breakdown</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-text-muted transition-transform",
              compositionOpen && "rotate-180",
            )}
          />
        </button>

        {compositionOpen ? (
          <div className="border-t border-border/70 px-4 pb-4 pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Selected cookies
            </p>
            {selections.length === 0 ? (
              <p className="mt-3 text-sm text-text-muted">
                No cookie selections were stored for this collection line.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[360px] text-left text-sm">
                  <thead>
                    <tr className={tableHeadClass}>
                      <th className={tableThClass}>Cookie</th>
                      <th className={cn(tableThClass, "text-right")}>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selections.map((selection) => (
                      <tr key={selection.id} className={tableRowClass}>
                        <td className={cn(tableTdClass, "text-text-primary")}>
                          {selection.product_name_snapshot}
                          {selection.is_premium_snapshot ? (
                            <span className="ml-2 text-xs text-text-muted">(Special Edition)</span>
                          ) : null}
                        </td>
                        <td className={cn(tableTdClass, "text-right tabular-nums text-text-secondary")}>
                          {formatQuantityDisplay(selection.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-3 text-sm text-text-secondary">
              Total cookies in this collection:{" "}
              <span className="font-medium text-text-primary">
                {totalCookies > 0 ? formatQuantityDisplay(totalCookies) : "—"}
              </span>
            </p>
          </div>
        ) : null}
      </div>

      {financialReady && canViewFinancials ? (
        <SectionCard title="Cookie financial breakdown (per collection)">
          <p className="mb-3 text-xs text-text-muted">
            Per collection — cookie pricing and production cost only. Packaging fee is shown in
            price construction below. Delivery is not included here; see Financial performance
            above for the full order.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className={tableHeadClass}>
                  <th className={tableThClass}>Cookie</th>
                  <th className={tableThClass}>Qty</th>
                  <th className={tableThClass}>Unit selling</th>
                  <th className={tableThClass}>Unit cost</th>
                  <th className={cn(tableThClass, "text-right")}>Revenue</th>
                  <th className={cn(tableThClass, "text-right")}>Cost</th>
                  <th className={cn(tableThClass, "text-right")}>Profit</th>
                  <th className={cn(tableThClass, "text-right")}>Margin</th>
                  <th className={cn(tableThClass, "text-right")}>Profit contribution</th>
                </tr>
              </thead>
              <tbody>
                {selections.map((selection) => {
                  const margin = parseAmount(selection.margin_percentage_snapshot) ?? 0;
                  return (
                    <tr key={selection.id} className={tableRowClass}>
                      <td className={cn(tableTdClass, "text-text-primary")}>
                        {selection.product_name_snapshot}
                      </td>
                      <td className={cn(tableTdClass, "text-text-secondary")}>
                        {formatQuantityDisplay(selection.quantity)}
                      </td>
                      <td className={cn(tableTdClass, "tabular-nums text-text-secondary")}>
                        {formatCurrency(selection.product_selling_price_snapshot!)}
                      </td>
                      <td className={cn(tableTdClass, "tabular-nums text-text-secondary")}>
                        {formatCurrency(selection.product_cost_snapshot!)}
                      </td>
                      <td className={cn(tableTdClass, "text-right tabular-nums")}>
                        {formatCurrency(selection.line_revenue_snapshot!)}
                      </td>
                      <td className={cn(tableTdClass, "text-right tabular-nums text-text-secondary")}>
                        {formatCurrency(selection.line_cost_snapshot!)}
                      </td>
                      <td className={cn(tableTdClass, "text-right tabular-nums font-medium")}>
                        {formatCurrency(selection.line_profit_snapshot!)}
                      </td>
                      <td
                        className={cn(
                          tableTdClass,
                          "text-right tabular-nums font-medium",
                          marginToneClass(margin),
                        )}
                      >
                        {formatPercent(selection.margin_percentage_snapshot!)}
                      </td>
                      <td className={cn(tableTdClass, "text-right tabular-nums text-text-secondary")}>
                        {selection.profit_contribution_percentage_snapshot != null
                          ? formatPercent(selection.profit_contribution_percentage_snapshot)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <dl className="mt-4 grid gap-2 border-t border-border/70 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-text-secondary">Collection revenue</dt>
              <dd className="tabular-nums font-medium">{formatCurrency(packRevenue)}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Collection cost</dt>
              <dd className="tabular-nums">{formatCurrency(packCost)}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Collection profit</dt>
              <dd className="tabular-nums font-medium">{formatCurrency(packProfit)}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Collection margin</dt>
              <dd className={cn("tabular-nums font-medium", marginToneClass(packMargin))}>
                {formatPercent(packMargin)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-text-muted">
            Totals reflect one collection (cookies + packaging fee in revenue), not the full order.
          </p>
        </SectionCard>
      ) : (
        <p className="text-sm text-text-muted">
          Per-cookie financial snapshots are unavailable for this legacy order. Composition is shown
          from stored selections only.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {canViewFinancials ? (
          <SectionCard title="Price construction (per collection snapshot)">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Selected cookie revenue</dt>
                <dd className="tabular-nums text-text-primary">
                  {line.cookies_subtotal_snapshot != null
                    ? formatCurrency(line.cookies_subtotal_snapshot)
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Packaging fee (included in selling price)</dt>
                <dd className="tabular-nums text-text-primary">
                  {line.package_fee_snapshot != null
                    ? formatCurrency(line.package_fee_snapshot)
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border/70 pt-2 font-medium">
                <dt className="text-text-primary">Collection selling price</dt>
                <dd className="tabular-nums text-text-primary">
                  {formatCurrency(line.collection_selling_price_snapshot)}
                </dd>
              </div>
            </dl>
          </SectionCard>
        ) : null}

        <SectionCard title="Production requirements (per collection)">
          {selections.length === 0 ? (
            <p className="text-sm text-text-muted">No production selections recorded.</p>
          ) : (
            <ul className="space-y-2 text-sm text-text-primary">
              {selections.map((selection) => (
                <li key={selection.id}>
                  <span className="font-medium">{selection.product_name_snapshot}</span>
                  <span className="text-text-secondary">
                    {" "}
                    × {formatQuantityDisplay(selection.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {canViewFinancials && insights.length > 0 ? (
        <SectionCard title="Cookie insights (per collection)">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {insights.map((insight) => (
              <div key={insight.label}>
                <dt className="text-text-secondary">{insight.label}</dt>
                <dd className="mt-0.5 font-medium text-text-primary">{insight.name}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>
      ) : null}
    </section>
  );
}
