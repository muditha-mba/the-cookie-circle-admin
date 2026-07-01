"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

const actionButtonBase = cn(
  "inline-flex shrink-0 items-center justify-center rounded-md border px-2.5 py-1",
  "text-xs font-medium leading-none transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/40",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

const actionVariants = {
  view: cn(
    actionButtonBase,
    "border-border bg-surface text-text-primary hover:bg-surface-hover",
  ),
  edit: cn(
    actionButtonBase,
    "border-warning/30 bg-warning/10 text-warning hover:bg-warning/15",
  ),
  delete: cn(
    actionButtonBase,
    "border-danger/30 bg-danger/10 text-danger hover:bg-danger/15",
  ),
  duplicate: cn(
    actionButtonBase,
    "border-info/30 bg-info/10 text-info hover:bg-info/15",
  ),
  extra: cn(
    actionButtonBase,
    "border-warning/30 bg-warning/10 text-warning hover:bg-warning/15",
  ),
} as const;

type ActionVariant = keyof typeof actionVariants;

type TableRowActionsProps = {
  viewHref?: string;
  editHref?: string;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteDisabled?: boolean;
  extra?: ReactNode;
  trailingExtra?: ReactNode;
  className?: string;
};

function stopRowClick(event: React.MouseEvent) {
  event.stopPropagation();
}

function ActionControl({
  variant,
  href,
  onClick,
  disabled,
  children,
}: {
  variant: ActionVariant;
  href?: string;
  onClick?: (event: React.MouseEvent) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const className = actionVariants[variant];

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        onClick={(event) => {
          stopRowClick(event);
          onClick?.(event);
        }}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

export function tableRowExtraActionClassName(): string {
  return actionVariants.extra;
}

export function TableRowActionButton({
  variant = "extra",
  className,
  onClick,
  disabled,
  children,
  ...props
}: {
  variant?: ActionVariant;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"button">, "type" | "onClick" | "disabled" | "children" | "className">) {
  return (
    <button
      type="button"
      className={cn(actionVariants[variant], className)}
      disabled={disabled}
      onClick={(event) => {
        stopRowClick(event);
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function TableRowActions({
  viewHref,
  editHref,
  onView,
  onEdit,
  onDelete,
  deleteDisabled = false,
  extra,
  trailingExtra,
  className,
}: TableRowActionsProps) {
  const hasView = Boolean(viewHref || onView);
  const hasEdit = Boolean(editHref || onEdit);
  const hasDelete = Boolean(onDelete);

  if (!hasView && !hasEdit && !hasDelete && !extra && !trailingExtra) {
    return <span className="text-sm text-text-muted">—</span>;
  }

  return (
    <div className={cn("flex min-w-[16rem] flex-nowrap items-center gap-1.5", className)}>
      {extra}

      {hasView ? (
        <ActionControl
          variant="view"
          href={viewHref}
          onClick={
            onView
              ? (event) => {
                  stopRowClick(event);
                  onView();
                }
              : undefined
          }
        >
          View
        </ActionControl>
      ) : null}

      {hasEdit ? (
        <ActionControl
          variant="edit"
          href={editHref}
          onClick={
            onEdit
              ? (event) => {
                  stopRowClick(event);
                  onEdit();
                }
              : undefined
          }
        >
          Edit
        </ActionControl>
      ) : null}

      {onDelete ? (
        <ActionControl
          variant="delete"
          disabled={deleteDisabled}
          onClick={(event) => {
            stopRowClick(event);
            onDelete();
          }}
        >
          Delete
        </ActionControl>
      ) : null}

      {trailingExtra}
    </div>
  );
}
