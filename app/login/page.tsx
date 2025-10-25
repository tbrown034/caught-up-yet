"use client";

import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-4xl font-bold">Sign In</h1>
        <p className="text-gray-600">Sign in with Google to continue</p>
        <Button variant="primary" onClick={handleGoogleLogin}>
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
