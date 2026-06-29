"use client";

import { AlertTriangle, Info } from "lucide-react";

import { ANALYTICS_CATEGORY_ACCENT_VAR } from "@/components/analytics/analytics-categories";
import type { OperationsAlertItem } from "@/lib/api/analytics";
import { cn } from "@/lib/utils";

type OperationsAlertCardProps = {
  alert: OperationsAlertItem;
};

const SEVERITY_STYLES: Record<string, string> = {
  warning: "border-amber-500/30 bg-amber-500/5",
  info: "border-border bg-surface",
  critical: "border-red-500/30 bg-red-500/5",
};

export function OperationsAlertCard({ alert }: OperationsAlertCardProps) {
  const accent = ANALYTICS_CATEGORY_ACCENT_VAR.operations;
  const Icon = alert.severity === "warning" ? AlertTriangle : Info;

  return (
    <article
      className={cn(
        "rounded-xl border p-4",
        SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.info,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="rounded-lg p-2"
          style={{ backgroundColor: "var(--analytics-operations-soft)" }}
        >
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-medium text-text-primary">{alert.title}</h3>
            <span className="text-lg font-semibold tabular-nums text-text-primary">
              {alert.count.toLocaleString("en-LK")}
              {alert.metric_label ? (
                <span className="ml-1 text-xs font-normal text-text-muted">
                  {alert.metric_label}
                </span>
              ) : null}
            </span>
          </div>
          <p className="mt-2 text-sm text-text-secondary">{alert.message}</p>
        </div>
      </div>
    </article>
  );
}
