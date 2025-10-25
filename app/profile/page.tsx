import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-4xl font-bold">Profile</h1>
        <div className="flex flex-col gap-2">
          <p className="text-gray-600">
            <span className="font-semibold">Email:</span> {user.email}
          </p>
          <p className="text-gray-600 text-sm">
            <span className="font-semibold">User ID:</span> {user.id}
          </p>
        </div>
      </div>
      <form action="/auth/signout" method="post">
        <Button type="submit" variant="secondary">
          Sign Out
        </Button>
      </form>
    </div>
  );
}
