"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        aria-hidden
        className="inline-flex h-9 w-[72px] rounded-lg border border-border bg-surface"
      />
    );
  }

  const isDark = (resolvedTheme ?? theme) === "dark";

  return (
    <div
      role="group"
      aria-label="Theme"
      className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface p-1"
    >
      <button
        type="button"
        aria-label="Light mode"
        aria-pressed={!isDark}
        onClick={() => setTheme("light")}
        className={cn(
          "inline-flex h-7 w-8 items-center justify-center rounded-md transition-all duration-200",
          !isDark
            ? "bg-surface-hover text-text-primary shadow-sm"
            : "text-text-muted hover:text-text-secondary",
        )}
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label="Dark mode"
        aria-pressed={isDark}
        onClick={() => setTheme("dark")}
        className={cn(
          "inline-flex h-7 w-8 items-center justify-center rounded-md transition-all duration-200",
          isDark
            ? "bg-surface-hover text-text-primary shadow-sm"
            : "text-text-muted hover:text-text-secondary",
        )}
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
