"use client";

import type { TrendGranularity } from "@/lib/api/analytics";
import { cn } from "@/lib/utils";

const OPTIONS: { id: TrendGranularity; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

export function AnalyticsGranularityToggle({
  value,
  onChange,
}: {
  value: TrendGranularity;
  onChange: (value: TrendGranularity) => void;
}) {
  return (
    <nav
      className="flex gap-1 rounded-md border border-border bg-background p-0.5"
      aria-label="Chart granularity"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "rounded px-2.5 py-1 text-xs font-medium transition-colors",
            value === option.id
              ? "bg-surface text-text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary",
          )}
        >
          {option.label}
        </button>
      ))}
    </nav>
  );
}
