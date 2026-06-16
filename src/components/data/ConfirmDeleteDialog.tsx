"use client";

import { useEffect, useId } from "react";

import { SecondaryButton } from "@/components/data/PageActions";
import { cn } from "@/lib/utils";

export const DEFAULT_DELETE_CONFIRM_MESSAGE =
  "Are you sure you want to delete this item? This action cannot be undone.";

type ConfirmDeleteDialogProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDeleteDialog({
  open,
  title = "Confirm deletion",
  message = DEFAULT_DELETE_CONFIRM_MESSAGE,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isConfirming) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isConfirming, onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
      onClick={() => {
        if (!isConfirming) {
          onCancel();
        }
      }}
    >
      <div className="absolute inset-0 bg-[var(--color-chocolate)]/45 backdrop-blur-sm" />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(
          "relative z-10 w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-xl",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="text-base font-semibold text-text-primary">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-text-secondary">
          {message}
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <SecondaryButton onClick={onCancel} disabled={isConfirming}>
            {cancelLabel}
          </SecondaryButton>
          <SecondaryButton
            type="button"
            variant="danger"
            disabled={isConfirming}
            onClick={onConfirm}
          >
            {isConfirming ? "Deleting..." : confirmLabel}
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
