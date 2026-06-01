import type { CustomerSegment } from "@/lib/api/customers";
import { cn } from "@/lib/utils";

const LABELS: Record<CustomerSegment, string> = {
  new: "New",
  returning: "Returning",
  vip: "VIP",
  inactive: "Inactive",
};

const STYLES: Record<CustomerSegment, string> = {
  new: "border-info/30 bg-info/10 text-info",
  returning: "border-primary/30 bg-primary/10 text-primary",
  vip: "border-warning/30 bg-warning/10 text-warning",
  inactive: "border-border bg-surface-hover text-text-secondary",
};

export function CustomerSegmentBadge({
  segment,
  className,
}: {
  segment: CustomerSegment | null | undefined;
  className?: string;
}) {
  if (!segment) {
    return <span className={cn("text-sm text-text-muted", className)}>—</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STYLES[segment],
        className,
      )}
    >
      {LABELS[segment]}
    </span>
  );
}
