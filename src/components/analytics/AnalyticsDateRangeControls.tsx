"use client";

import {
  ANALYTICS_DATE_PRESETS,
  type AnalyticsDatePreset,
  type AnalyticsDateRange,
} from "@/lib/api/analytics";
import { cn } from "@/lib/utils";

type PresetOption = { id: AnalyticsDatePreset; label: string };

type AnalyticsDateRangeControlsProps = {
  preset: AnalyticsDatePreset;
  customStart: string;
  customEnd: string;
  onPresetChange: (preset: AnalyticsDatePreset) => void;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
  resolvedRange?: AnalyticsDateRange;
  /** Override preset list (e.g. production analytics forward-looking presets). */
  presets?: PresetOption[];
};

export function AnalyticsDateRangeControls({
  preset,
  customStart,
  customEnd,
  onPresetChange,
  onCustomStartChange,
  onCustomEndChange,
  resolvedRange,
  presets = ANALYTICS_DATE_PRESETS,
}: AnalyticsDateRangeControlsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Date range
          </p>
          {resolvedRange ? (
            <p className="mt-1 text-sm text-text-muted">
              {resolvedRange.start_date} → {resolvedRange.end_date}
            </p>
          ) : preset === "custom" ? (
            <p className="mt-1 text-sm text-text-muted">Select start and end dates</p>
          ) : null}
        </div>
      </div>

      <nav
        className="flex flex-wrap gap-1 rounded-lg border border-border bg-background p-1"
        aria-label="Date range presets"
      >
        {presets.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPresetChange(item.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              preset === item.id
                ? "bg-surface text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {preset === "custom" ? (
        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-text-secondary">Start date</span>
            <input
              type="date"
              value={customStart}
              onChange={(event) => onCustomStartChange(event.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-text-primary"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-text-secondary">End date</span>
            <input
              type="date"
              value={customEnd}
              onChange={(event) => onCustomEndChange(event.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-text-primary"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
