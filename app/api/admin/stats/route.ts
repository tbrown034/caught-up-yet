import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
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

    // Get database statistics
    const [roomsResult, membersResult, messagesResult, activeRoomsResult] =
      await Promise.all([
        supabase.from("rooms").select("*", { count: "exact", head: true }),
        supabase
          .from("room_members")
          .select("user_id", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase
          .from("rooms")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)
          .gt("expires_at", new Date().toISOString()),
      ]);

    // Get unique users count
    const { data: uniqueUsers } = await supabase
      .from("room_members")
      .select("user_id");

    const uniqueUserCount = uniqueUsers
      ? new Set(uniqueUsers.map((m) => m.user_id)).size
      : 0;

    // Get recent rooms with details
    const { data: recentRooms } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    // Get database table sizes (approximate)
    const tableStats = {
      rooms: {
        count: roomsResult.count || 0,
        active: activeRoomsResult.count || 0,
      },
      room_members: {
        count: membersResult.count || 0,
        unique_users: uniqueUserCount,
      },
      messages: {
        count: messagesResult.count || 0,
      },
    };

    // System info
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      env: process.env.NODE_ENV || "development",
      deploymentUrl:
        process.env.NEXT_PUBLIC_VERCEL_URL ||
        process.env.VERCEL_URL ||
        "localhost:3000",
    };

    // Supabase info
    const supabaseInfo = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not configured",
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      projectId: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0]
        : null,
    };

    return NextResponse.json({
      success: true,
      stats: {
        database: tableStats,
        system: systemInfo,
        supabase: supabaseInfo,
        recentRooms: recentRooms || [],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
