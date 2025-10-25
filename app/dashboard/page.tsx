import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <p className="text-gray-600">Welcome, {data.user.email}</p>
      <form action="/auth/signout" method="post">
        <Button type="submit" variant="secondary">
          Sign Out
        </Button>
      </form>
    </div>
  );
}
