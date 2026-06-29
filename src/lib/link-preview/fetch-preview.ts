import type { LinkPreviewResult } from "@/lib/link-preview/types";
import {
  detectPlatformFromUrl,
  extractYouTubeVideoId,
  youtubeThumbnailUrl,
} from "@/lib/link-preview/platforms";
import { parseOpenGraphPreview } from "@/lib/link-preview/og-parser";
import { assertSafePreviewUrl } from "@/lib/link-preview/ssrf";

const FETCH_TIMEOUT_MS = 8_000;
const MAX_HTML_BYTES = 1_000_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; TheCookieCircleAdmin/1.0; +https://thecookiecircle.lk)";

type TikTokOEmbedResponse = {
  title?: string;
  thumbnail_url?: string;
};

async function fetchHtml(url: URL): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": USER_AGENT,
      },
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Preview request failed with status ${response.status}.`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      throw new Error("The linked page did not return HTML metadata.");
    }

    const body = await response.text();
    if (body.length > MAX_HTML_BYTES) {
      throw new Error("The linked page response was too large to parse.");
    }

    return body;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchTikTokPreview(postUrl: URL): Promise<LinkPreviewResult> {
  const endpoint = new URL("https://www.tiktok.com/oembed");
  endpoint.searchParams.set("url", postUrl.toString());

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint.toString(), {
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`TikTok preview request failed with status ${response.status}.`);
    }

    const data = (await response.json()) as TikTokOEmbedResponse;
    if (!data.thumbnail_url) {
      throw new Error("TikTok did not return a preview image for this post.");
    }

    return {
      preview_image_url: data.thumbnail_url,
      title: data.title?.trim() ?? "",
      platform: "tiktok",
      source: "tiktok-oembed",
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchOpenGraphPreview(postUrl: URL): Promise<LinkPreviewResult> {
  const html = await fetchHtml(postUrl);
  const parsed = parseOpenGraphPreview(html);

  if (!parsed.preview_image_url) {
    throw new Error(
      "No preview image was found. Paste a direct preview image URL manually.",
    );
  }

  return {
    preview_image_url: parsed.preview_image_url,
    title: parsed.title?.trim() ?? "",
    platform: detectPlatformFromUrl(postUrl),
    source: parsed.source,
  };
}

export async function fetchLinkPreview(rawUrl: string): Promise<LinkPreviewResult> {
  const postUrl = assertSafePreviewUrl(rawUrl);
  const platform = detectPlatformFromUrl(postUrl);

  if (platform === "youtube") {
    const videoId = extractYouTubeVideoId(postUrl);
    if (!videoId) {
      throw new Error("Could not extract a YouTube video ID from this URL.");
    }

    return {
      preview_image_url: youtubeThumbnailUrl(videoId),
      title: "",
      platform: "youtube",
      source: "youtube",
    };
  }

  if (platform === "tiktok") {
    try {
      return await fetchTikTokPreview(postUrl);
    } catch {
      return fetchOpenGraphPreview(postUrl);
    }
  }

  return fetchOpenGraphPreview(postUrl);
}
