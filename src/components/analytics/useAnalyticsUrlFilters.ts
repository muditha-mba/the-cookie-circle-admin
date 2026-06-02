"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { AnalyticsDatePreset, TrendGranularity } from "@/lib/api/analytics";

type UseAnalyticsUrlFiltersOptions = {
  defaultPreset?: AnalyticsDatePreset;
  defaultGranularity?: TrendGranularity;
};

const VALID_PRESETS: AnalyticsDatePreset[] = [
  "today",
  "last_7_days",
  "last_30_days",
  "last_90_days",
  "last_12_months",
  "next_batch",
  "next_7_days",
  "next_30_days",
  "custom",
];

const VALID_GRANULARITIES: TrendGranularity[] = ["day", "week", "month"];

export function useAnalyticsUrlFilters(options?: UseAnalyticsUrlFiltersOptions) {
  const defaultPreset = options?.defaultPreset ?? "last_30_days";
  const defaultGranularity = options?.defaultGranularity ?? "day";
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const preset = useMemo<AnalyticsDatePreset>(() => {
    const value = searchParams.get("preset");
    return VALID_PRESETS.includes(value as AnalyticsDatePreset)
      ? (value as AnalyticsDatePreset)
      : defaultPreset;
  }, [searchParams, defaultPreset]);

  const granularity = useMemo<TrendGranularity>(() => {
    const value = searchParams.get("granularity");
    return VALID_GRANULARITIES.includes(value as TrendGranularity)
      ? (value as TrendGranularity)
      : defaultGranularity;
  }, [searchParams, defaultGranularity]);

  const customStart = searchParams.get("start_date") ?? "";
  const customEnd = searchParams.get("end_date") ?? "";

  const patchQuery = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (!value) next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setPreset = useCallback(
    (value: AnalyticsDatePreset) => {
      patchQuery({
        preset: value,
        ...(value === "custom" ? {} : { start_date: null, end_date: null }),
      });
    },
    [patchQuery],
  );

  const setCustomStart = useCallback((value: string) => patchQuery({ start_date: value || null }), [patchQuery]);
  const setCustomEnd = useCallback((value: string) => patchQuery({ end_date: value || null }), [patchQuery]);
  const setGranularity = useCallback(
    (value: TrendGranularity) => patchQuery({ granularity: value }),
    [patchQuery],
  );

  return {
    preset,
    customStart,
    customEnd,
    granularity,
    setPreset,
    setCustomStart,
    setCustomEnd,
    setGranularity,
  };
}
