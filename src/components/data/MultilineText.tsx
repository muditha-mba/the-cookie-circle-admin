import { cn } from "@/lib/utils";

type MultilineTextProps = {
  value: string | null | undefined;
  className?: string;
  emptyFallback?: string;
};

/** Read-only text that preserves stored newlines (notes, addresses, etc.). */
export function MultilineText({
  value,
  className,
  emptyFallback = "—",
}: MultilineTextProps) {
  if (!value?.trim()) {
    return <span className={className}>{emptyFallback}</span>;
  }

  return <span className={cn("whitespace-pre-wrap", className)}>{value}</span>;
}
