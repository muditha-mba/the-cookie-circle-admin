import type { SocialPlatform } from "@/lib/api/shared-memories";

export type LinkPreviewResult = {
  preview_image_url: string;
  title: string;
  platform: SocialPlatform | null;
  source: "youtube" | "tiktok-oembed" | "open-graph" | "twitter-card";
};

export type LinkPreviewErrorCode =
  | "invalid_url"
  | "blocked_url"
  | "fetch_failed"
  | "preview_not_found";
