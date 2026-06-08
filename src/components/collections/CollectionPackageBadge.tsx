"use client";

import { cn } from "@/lib/utils";

const toneClassMap: Record<string, string> = {
  violet: "border-violet-200 bg-violet-100 text-violet-800",
  blue: "border-blue-200 bg-blue-100 text-blue-800",
  amber: "border-amber-200 bg-amber-100 text-amber-800",
  neutral: "border-border bg-surface-hover text-text-secondary",
};

type CollectionPackageBadgeProps = {
  name: string | null | undefined;
  tone?: string | null | undefined;
  className?: string;
};

export function CollectionPackageBadge({ name, tone, className }: CollectionPackageBadgeProps) {
  if (!name) {
    return <span className={cn("text-sm text-text-muted", className)}>—</span>;
  }

  const colorClass = tone ? toneClassMap[tone] ?? toneClassMap.neutral : toneClassMap.neutral;

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        className,
      )}
    >
      {name}
    </span>
  );
}
