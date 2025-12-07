import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Default to /games - this is where users expect to land after login
  const next = searchParams.get("next") ?? "/games";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Decode the next param in case it was encoded
      const decodedNext = decodeURIComponent(next);
      return NextResponse.redirect(`${origin}${decodedNext}`);
    }
  }

  // On error, redirect to login with an error indicator
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
