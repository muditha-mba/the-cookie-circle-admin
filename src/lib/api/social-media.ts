import { apiClient } from "@/lib/api/client";

export type SocialPlatform = "instagram" | "facebook" | "tiktok" | "youtube";

export type SocialMediaLink = {
  platform: SocialPlatform;
  url: string;
  is_enabled: boolean;
};

export type SocialMediaSettings = {
  links: SocialMediaLink[];
};

export type SocialMediaLinkUpdate = {
  platform: SocialPlatform;
  url?: string;
  is_enabled?: boolean;
};

const BASE = "/api/v1/business-settings/social-media";

export const socialMediaApi = {
  get: () => apiClient.get<SocialMediaSettings>(BASE),

  update: (links: SocialMediaLinkUpdate[]) =>
    apiClient.patch<SocialMediaSettings>(BASE, { links }),
};
