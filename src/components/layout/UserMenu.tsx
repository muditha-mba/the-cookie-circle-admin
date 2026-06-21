"use client";

import { LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/providers/AuthProvider";
import {
  formatSignedInRole,
  getUserDisplayName,
  getUserInitials,
} from "@/lib/user-display";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!user) {
    return null;
  }

  const initials = getUserInitials(user);
  const displayName = getUserDisplayName(user);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Open account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full",
          "border border-border bg-surface-elevated text-xs font-medium text-text-primary",
          "transition-colors duration-200 hover:bg-surface-hover",
          open && "bg-surface-hover ring-2 ring-info/20",
        )}
      >
        {initials}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account menu"
          className={cn(
            "absolute right-0 z-50 mt-2 w-64 origin-top-right",
            "rounded-lg border border-border bg-surface-elevated p-1.5 shadow-lg",
          )}
        >
          <div className="rounded-md px-3 py-2.5">
            <p className="truncate text-sm font-medium text-text-primary">
              {displayName}
            </p>
            <p className="mt-0.5 truncate text-xs text-text-secondary">
              {user.email}
            </p>
            <p className="mt-2 inline-flex rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-muted">
              {formatSignedInRole(user)}
            </p>
          </div>

          <div className="my-1 h-px bg-border" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm",
              "text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary",
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
