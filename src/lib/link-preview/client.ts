import type { LinkPreviewResult } from "@/lib/link-preview/types";

type LinkPreviewErrorResponse = {
  message?: string;
};

export async function fetchLinkPreviewFromAdmin(postUrl: string): Promise<LinkPreviewResult> {
  const endpoint = new URL("/api/link-preview", window.location.origin);
  endpoint.searchParams.set("url", postUrl.trim());

  const response = await fetch(endpoint.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as LinkPreviewErrorResponse | null;
    throw new Error(errorBody?.message ?? "Unable to fetch preview for this post.");
  }

  return (await response.json()) as LinkPreviewResult;
}
