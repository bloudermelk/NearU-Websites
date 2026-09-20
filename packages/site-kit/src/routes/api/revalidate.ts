import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand revalidation, called by content-editing scripts right after
 * upserting into Supabase so the change shows up immediately instead of
 * waiting for the timed `revalidate` window.
 *
 *   curl -X POST "https://<site>/api/revalidate?secret=$REVALIDATE_SECRET&path=/about-us"
 *
 * Omit `path` (or pass `path=/`) to revalidate the whole site (layout-level).
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const path = request.nextUrl.searchParams.get("path") ?? "/";
  revalidatePath(path, path === "/" ? "layout" : "page");

  return NextResponse.json({ revalidated: true, path, now: Date.now() });
}
