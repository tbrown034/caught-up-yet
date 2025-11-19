import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

// GET /api/admin/users - Get all users (admin only)
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin access
    if (!isAdmin(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users from auth.users
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Get room counts for each user
    const usersWithStats = await Promise.all(
      data.users.map(async (u) => {
        // Count rooms created
        const { count: roomsCreated } = await supabase
          .from("rooms")
          .select("*", { count: "exact", head: true })
          .eq("created_by", u.id);

        // Count rooms joined
        const { count: roomsJoined } = await supabase
          .from("room_members")
          .select("*", { count: "exact", head: true })
          .eq("user_id", u.id);

        return {
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          is_anonymous: u.is_anonymous,
          roomsCreated: roomsCreated || 0,
          roomsJoined: roomsJoined || 0,
        };
      })
    );

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error("Unexpected error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
