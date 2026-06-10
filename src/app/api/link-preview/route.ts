import { NextResponse } from "next/server";

import { fetchLinkPreview } from "@/lib/link-preview/fetch-preview";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url")?.trim();

  if (!url) {
    return NextResponse.json({ message: "A post URL is required." }, { status: 400 });
  }

  try {
    const preview = await fetchLinkPreview(url);
    return NextResponse.json(preview);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to fetch a preview for this post.";

    return NextResponse.json({ message }, { status: 422 });
  }
}
