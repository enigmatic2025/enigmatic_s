// Proxy kept as an entry point for future middleware work
// (e.g. Supabase session refresh, auth guards).
export default function proxy() {
  return undefined;
}

export const config = {
    // Match all pathnames except API, static files, and Next.js internals
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
