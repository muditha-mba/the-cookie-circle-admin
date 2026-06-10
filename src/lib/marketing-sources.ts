import type { MarketingSource } from "@/lib/api/customers";

export const MARKETING_SOURCE_OPTIONS: { value: MarketingSource; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "tiktok", label: "TikTok" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "X / Twitter" },
  { value: "pinterest", label: "Pinterest" },
  { value: "email", label: "Email" },
  { value: "google", label: "Google" },
  { value: "referral", label: "Referral" },
  { value: "walk_in", label: "Walk In" },
  { value: "other", label: "Other" },
];

export function formatMarketingSourceLabel(source: string | null | undefined): string {
  if (!source) {
    return "—";
  }
  const match = MARKETING_SOURCE_OPTIONS.find((option) => option.value === source);
  if (match) {
    return match.label;
  }
  return source.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
