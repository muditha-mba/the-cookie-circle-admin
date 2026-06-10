function decodeHtmlEntities(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function extractMetaTag(html: string, key: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${key}["'][^>]*>`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtmlEntities(match[1].trim());
    }
  }

  return null;
}

export function parseOpenGraphPreview(html: string): {
  preview_image_url: string | null;
  title: string | null;
  source: "open-graph" | "twitter-card";
} {
  const ogImage = extractMetaTag(html, "og:image");
  const twitterImage = extractMetaTag(html, "twitter:image");
  const preview_image_url = ogImage ?? twitterImage;

  const ogTitle = extractMetaTag(html, "og:title");
  const twitterTitle = extractMetaTag(html, "twitter:title");
  const title = ogTitle ?? twitterTitle;

  return {
    preview_image_url,
    title,
    source: ogImage || ogTitle ? "open-graph" : "twitter-card",
  };
}
