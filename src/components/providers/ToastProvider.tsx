"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";
import "sonner/dist/styles.css";
import type { ReactNode } from "react";

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const { resolvedTheme } = useTheme();

  return (
    <>
      {children}
      <Toaster
        className="admin-toaster"
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        position="top-right"
        offset={16}
        closeButton
        richColors
        expand={false}
        visibleToasts={4}
        toastOptions={{
          duration: 4800,
          classNames: {
            toast:
              "border border-border bg-surface text-text-primary shadow-lg",
            title: "text-sm font-medium",
            description: "text-sm text-text-secondary",
            closeButton: "text-text-secondary hover:text-text-primary",
          },
        }}
      />
    </>
  );
}
