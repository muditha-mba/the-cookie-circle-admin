"use client";

import {
  getStatusBadgeDefinition,
  type StatusBadgeKind,
  type StatusBadgeValue,
} from "@/config/status-badges";
import { cn } from "@/lib/utils";

type EnumStatusBadgeProps<K extends StatusBadgeKind> = {
  kind: K;
  value: StatusBadgeValue<K> | null | undefined;
  className?: string;
};

export function EnumStatusBadge<K extends StatusBadgeKind>({
  kind,
  value,
  className,
}: EnumStatusBadgeProps<K>) {
  if (value == null) {
    return <span className={cn("text-sm text-text-muted", className)}>—</span>;
  }

  const { label, className: statusClassName } = getStatusBadgeDefinition(kind, value);

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusClassName,
        className,
      )}
    >
      {label}
    </span>
  );
}
