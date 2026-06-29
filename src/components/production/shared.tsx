"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-xs text-text-muted">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-text-muted">{message}</p>;
}

export function SimpleTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | ReactNode)[][];
}) {
  if (rows.length === 0) {
    return <EmptyState message="Nothing to show for this date." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[320px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-text-secondary">
            {headers.map((header) => (
              <th key={header} className="px-2 py-2 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-border/60 last:border-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-2 py-2.5 text-text-primary tabular-nums"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type ProductionTab = "summary" | "ingredients" | "packaging" | "readiness" | "purchase";

const TABS: { id: ProductionTab; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "ingredients", label: "Ingredients" },
  { id: "packaging", label: "Packaging" },
  { id: "readiness", label: "Stock Readiness" },
  { id: "purchase", label: "Purchase Planning" },
];

export function ProductionTabs({
  activeTab,
  onChange,
}: {
  activeTab: ProductionTab;
  onChange: (tab: ProductionTab) => void;
}) {
  return (
    <nav className="flex flex-wrap gap-1 rounded-lg border border-border bg-background p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
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
  );
}
