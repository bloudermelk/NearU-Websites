export { proxy } from "@nearu/site-kit/proxy";

// Segment config must be a literal in this file (Next.js requirement).
// Skip Next internals, API routes, and static files so DB-driven redirects
// don't cost a lookup on every asset request.
export const config = {
  matcher: ["/((?!_next/static|_next/image|api|.*\\..*).*)"],
};
