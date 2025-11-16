import { createClient } from "@/lib/supabase/server";
import Button from "@/components/ui/Button";
import { CircleUser } from "lucide-react";

export default async function HeaderAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return (
      <div className="flex gap-3 items-center">
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="secondary" size="sm">
            Sign Out
          </Button>
        </form>
        <Button
          variant="ghost"
          size="sm"
          href="/profile"
          asLink
          aria-label="View profile"
        >
          <CircleUser className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  return (
    <Button variant="primary" size="sm" href="/login" asLink>
      Sign In
    </Button>
  );
}
