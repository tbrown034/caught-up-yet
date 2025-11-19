import { createClient } from "@/lib/supabase/server";
import Button from "@/components/ui/Button";
import { CircleUser, Shield } from "lucide-react";
import Link from "next/link";
import { isAdmin } from "@/lib/admin";

export default async function HeaderAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Extract display name from email (before @)
    const displayName = user.email?.split("@")[0] || "User";
    const userIsAdmin = isAdmin(user.email);

    return (
      <div className="flex gap-3 items-center">
        {userIsAdmin && (
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
            title="Admin Dashboard"
          >
            <Shield className="w-5 h-5" />
            <span>Admin</span>
          </Link>
        )}
        <Link
          href="/profile"
          className="hidden sm:flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <CircleUser className="w-5 h-5" />
          <span className="max-w-[120px] truncate">{displayName}</span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          href="/profile"
          asLink
          className="sm:hidden"
        >
          <CircleUser className="w-5 h-5" />
        </Button>
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="secondary" size="sm">
            Sign Out
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Button variant="primary" size="sm" href="/login" asLink>
      Sign In
    </Button>
  );
}
