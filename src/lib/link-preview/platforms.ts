import type { SocialPlatform } from "@/lib/api/shared-memories";

const PLATFORM_HOSTS: Record<SocialPlatform, string[]> = {
  instagram: ["instagram.com", "www.instagram.com"],
  facebook: ["facebook.com", "www.facebook.com", "m.facebook.com", "fb.com", "www.fb.com", "fb.watch"],
  tiktok: ["tiktok.com", "www.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"],
  youtube: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"],
};

export function detectPlatformFromUrl(url: URL): SocialPlatform | null {
  const host = url.hostname.toLowerCase();

  for (const [platform, hosts] of Object.entries(PLATFORM_HOSTS) as [SocialPlatform, string[]][]) {
    if (hosts.includes(host)) {
      return platform;
    }
  }

  return null;
}

export function extractYouTubeVideoId(url: URL): string | null {
  const host = url.hostname.toLowerCase();

  if (host === "youtu.be" || host === "www.youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id ?? null;
  }

  if (!host.includes("youtube.com")) {
    return null;
  }

  const pathParts = url.pathname.split("/").filter(Boolean);
  const fromQuery = url.searchParams.get("v");
  if (fromQuery) {
    return fromQuery;
  }

  if (pathParts[0] === "shorts" || pathParts[0] === "embed" || pathParts[0] === "live") {
    return pathParts[1] ?? null;
  }

  return null;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}
