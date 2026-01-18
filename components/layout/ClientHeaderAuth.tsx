"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { UserCircleIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { isAdmin } from "@/lib/admin";
import type { User } from "@supabase/supabase-js";

export default function ClientHeaderAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
    );
  }

  if (user) {
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
          <span className="hidden sm:inline max-w-[120px] truncate">
            {displayName}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      href="/login"
      asLink
      className="whitespace-nowrap"
    >
      Sign In
    </Button>
  );
}
