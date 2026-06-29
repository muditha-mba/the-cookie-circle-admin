import type { MetadataRoute } from "next";

/** Admin is internal — never allow search engine crawling. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
