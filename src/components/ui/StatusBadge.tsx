import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  active: boolean;
  className?: string;
};

export function StatusBadge({ active, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
        active ? "bg-success/10 text-success" : "bg-surface-hover text-text-muted",
        className,
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
