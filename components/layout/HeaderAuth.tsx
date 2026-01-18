import { createClient } from "@/lib/supabase/server";
import Button from "@/components/ui/Button";
import { UserCircleIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
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
      <div className="flex gap-2 sm:gap-3 items-center">
        {userIsAdmin && (
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
            title="Admin Dashboard"
          >
            <ShieldCheckIcon className="w-5 h-5" />
            <span>Admin</span>
          </Link>
        )}
        <Link
          href="/profile"
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <UserCircleIcon className="w-5 h-5" />
          <span className="hidden sm:inline max-w-[120px] truncate">{displayName}</span>
        </Link>
      </div>
    );
  }

  return (
    <Button variant="primary" size="sm" href="/login" asLink className="whitespace-nowrap">
      Sign In
    </Button>
  );
}
