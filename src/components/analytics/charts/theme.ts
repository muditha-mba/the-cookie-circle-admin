"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";

export type AnalyticsChartTheme = {
  primary: string;
  grid: string;
  axis: string;
  tooltipBackground: string;
  tooltipBorder: string;
  tooltipText: string;
  palette: string[];
};

const FALLBACK: AnalyticsChartTheme = {
  primary: "#2563eb",
  grid: "#e4e4e7",
  axis: "#a1a1aa",
  tooltipBackground: "#ffffff",
  tooltipBorder: "#e4e4e7",
  tooltipText: "#52525b",
  palette: ["#2563eb", "#16a34a", "#ca8a04", "#9333ea", "#0891b2", "#dc2626"],
};

function readCssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** Resolves admin semantic tokens for Recharts (updates on theme change). */
export function useAnalyticsChartTheme(): AnalyticsChartTheme {
  const { resolvedTheme } = useTheme();

  return useMemo(() => {
    const primary = readCssVar("--info", FALLBACK.primary);
    return {
      primary,
      grid: readCssVar("--border", FALLBACK.grid),
      axis: readCssVar("--text-muted", FALLBACK.axis),
      tooltipBackground: readCssVar("--surface-elevated", FALLBACK.tooltipBackground),
      tooltipBorder: readCssVar("--border", FALLBACK.tooltipBorder),
      tooltipText: readCssVar("--text-secondary", FALLBACK.tooltipText),
      palette: [
        primary,
        readCssVar("--success", FALLBACK.palette[1]!),
        readCssVar("--warning", FALLBACK.palette[2]!),
        "#9333ea",
        readCssVar("--info", FALLBACK.palette[4]!),
        readCssVar("--danger", FALLBACK.palette[5]!),
      ],
    };
  }, [resolvedTheme]);
}
