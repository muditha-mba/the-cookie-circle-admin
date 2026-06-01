import Link from "next/link";

import { cn } from "@/lib/utils";

type PageActionsProps = {
  backHref?: string;
  backLabel?: string;
  children?: React.ReactNode;
  className?: string;
};

const buttonClassName = cn(
  "inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium",
  "text-text-primary transition-colors hover:bg-surface-hover",
);

const primaryClassName = cn(
  "inline-flex items-center justify-center rounded-md bg-text-primary px-4 py-2 text-sm font-medium",
  "text-background transition-colors hover:opacity-90",
);

export function PageActions({ backHref, backLabel = "Back", children, className }: PageActionsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {backHref ? (
        <Link href={backHref} className={buttonClassName}>
          {backLabel}
        </Link>
      ) : null}
      {children}
    </div>
  );
}

export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={primaryClassName}>
      {children}
    </Link>
  );
}

export function SecondaryButton({
  type = "button",
  onClick,
  disabled,
  children,
  variant = "default",
}: {
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        buttonClassName,
        variant === "danger" && "border-danger/30 text-danger hover:bg-danger/10",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  type = "submit",
  disabled,
  children,
}: {
  type?: "button" | "submit";
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(primaryClassName, disabled && "cursor-not-allowed opacity-50")}
    >
      {children}
    </button>
  );
}
