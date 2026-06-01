import { cn } from "@/lib/utils";

type DetailFieldProps = {
  label: string;
  value: React.ReactNode;
  /** Span all columns (use only for long multi-line content). */
  fullWidth?: boolean;
  className?: string;
};

export function DetailField({ label, value, fullWidth = false, className }: DetailFieldProps) {
  return (
    <div className={cn("min-w-0 space-y-1", fullWidth && "col-span-full", className)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </dt>
      <dd className="break-words text-sm text-text-primary">{value}</dd>
    </div>
  );
}
