import { EnumStatusBadge } from "@/components/ui/EnumStatusBadge";
import type { CustomerSegment } from "@/lib/api/customers";
import { cn } from "@/lib/utils";

export function CustomerSegmentBadge({
  segment,
  className,
}: {
  segment: CustomerSegment | null | undefined;
  className?: string;
}) {
  return (
    <EnumStatusBadge
      kind="customer-segment"
      value={segment}
      className={cn(className)}
    />
  );
}
