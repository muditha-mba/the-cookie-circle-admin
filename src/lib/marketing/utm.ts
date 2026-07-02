/** Canonical site URL for marketing links — matches client SITE.url */
export const MARKETING_SITE_URL = "https://thecookiecircle.lk";

export const CUSTOM_OPTION = "__custom__" as const;

export type UtmPreset = {
  label: string;
  value: string;
};

export const LANDING_PATH_PRESETS: UtmPreset[] = [
  { label: "Order / build flow (recommended for QR)", value: "/order" },
  { label: "Home", value: "/" },
  { label: "Products", value: "/products" },
  { label: "Catering section", value: "/#catering" },
  { label: "FAQ", value: "/faq" },
];

/** Aligned with docs/UTM-formats.md */
export const UTM_SOURCE_PRESETS: UtmPreset[] = [
  { label: "QR / print materials", value: "qr" },
  { label: "Instagram", value: "instagram" },
  { label: "Facebook", value: "facebook" },
  { label: "TikTok", value: "tiktok" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Google", value: "google" },
  { label: "YouTube", value: "youtube" },
  { label: "Email", value: "email" },
  { label: "PickMe / partner", value: "pickme" },
];

export const UTM_MEDIUM_PRESETS: UtmPreset[] = [
  { label: "Print (flyers, packaging, cards)", value: "print" },
  { label: "Social (bio, organic posts)", value: "social" },
  { label: "Paid (ads)", value: "paid" },
  { label: "Organic (Google Business, SEO)", value: "organic" },
  { label: "CPC (Google Ads)", value: "cpc" },
  { label: "Email", value: "email" },
  { label: "Referral (influencer, partner)", value: "referral" },
];

export function slugifyUtm(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidUtmSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export type MarketingUrlInput = {
  landingPath: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign?: string | null;
};

export function resolveUtmField(
  selected: string,
  customValue: string,
): { value: string | null; error: string | null } {
  if (selected !== CUSTOM_OPTION) {
    return { value: selected, error: null };
  }

  const slug = slugifyUtm(customValue);
  if (!slug) {
    return { value: null, error: "Enter a custom value." };
  }
  if (!isValidUtmSlug(slug)) {
    return {
      value: null,
      error: "Use lowercase letters, numbers, and hyphens only.",
    };
  }

  return { value: slug, error: null };
}

export function buildMarketingUrl({
  landingPath,
  utmSource,
  utmMedium,
  utmCampaign,
}: MarketingUrlInput): string {
  const normalizedPath = landingPath.startsWith("/") ? landingPath : `/${landingPath}`;
  const url = new URL(normalizedPath, MARKETING_SITE_URL);

  url.searchParams.set("utm_source", utmSource);
  url.searchParams.set("utm_medium", utmMedium);

  const campaign = utmCampaign?.trim();
  if (campaign) {
    url.searchParams.set("utm_campaign", campaign);
  }

  return url.toString();
}

export function buildQrDownloadFilename({
  utmSource,
  utmMedium,
  utmCampaign,
}: {
  utmSource: string;
  utmMedium: string;
  utmCampaign?: string | null;
}): string {
  const parts = ["tcc-qr", utmSource, utmMedium];
  if (utmCampaign?.trim()) {
    parts.push(utmCampaign.trim());
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return `${parts.join("-")}-${stamp}.png`;
}
