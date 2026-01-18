import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Allowlist of safe internal redirect paths
const SAFE_REDIRECT_PREFIXES = ["/games", "/dashboard", "/profile", "/rooms", "/admin"];
const DEFAULT_REDIRECT = "/games";

function isValidRedirect(path: string): boolean {
  // Must start with / and not contain protocol or double slashes
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return false;
  }
  // Must match one of our safe prefixes
  return SAFE_REDIRECT_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix + "/")
  );
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? DEFAULT_REDIRECT;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Decode and validate the redirect path
      let decodedNext: string;
      try {
        decodedNext = decodeURIComponent(next);
      } catch {
        decodedNext = DEFAULT_REDIRECT;
      }
      const safePath = isValidRedirect(decodedNext) ? decodedNext : DEFAULT_REDIRECT;
      return NextResponse.redirect(`${origin}${safePath}`);
    }
  }

  // On error, redirect to login with an error indicator
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
