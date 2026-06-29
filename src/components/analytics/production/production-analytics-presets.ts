import {
  ANALYTICS_DATE_PRESETS,
  type AnalyticsDatePreset,
} from "@/lib/api/analytics";

const FORWARD_PRESETS: { id: AnalyticsDatePreset; label: string }[] = [
  { id: "next_batch", label: "Next batch" },
  { id: "next_7_days", label: "Next 7 days" },
  { id: "next_30_days", label: "Next 30 days" },
];

export const PRODUCTION_ANALYTICS_DATE_PRESETS: {
  id: AnalyticsDatePreset;
  label: string;
}[] = [...ANALYTICS_DATE_PRESETS, ...FORWARD_PRESETS];
