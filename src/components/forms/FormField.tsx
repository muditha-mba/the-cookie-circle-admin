import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

export const formInputClassName = cn(
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
  "text-text-primary placeholder:text-text-muted",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info",
);

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-text-muted">{hint}</p> : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
