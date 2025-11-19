import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

// GET /api/admin/rooms - Get all rooms (admin only)
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

    // Get all rooms with creator email
    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: false });

    if (roomsError) {
      console.error("Error fetching rooms:", roomsError);
      return NextResponse.json(
        { error: "Failed to fetch rooms" },
        { status: 500 }
      );
    }

    // Get member counts and creator emails for each room
    const roomsWithDetails = await Promise.all(
      (rooms || []).map(async (room) => {
        // Get member count
        const { count: memberCount } = await supabase
          .from("room_members")
          .select("*", { count: "exact", head: true })
          .eq("room_id", room.id);

        // Get message count
        const { count: messageCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("room_id", room.id);

        // Get creator email
        const { data: userData } = await supabase.auth.admin.getUserById(
          room.created_by
        );

        return {
          ...room,
          memberCount: memberCount || 0,
          messageCount: messageCount || 0,
          creatorEmail: userData?.user?.email || "Unknown",
        };
      })
    );

    return NextResponse.json({ rooms: roomsWithDetails });
  } catch (error) {
    console.error("Unexpected error fetching rooms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
