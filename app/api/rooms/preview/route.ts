import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/rooms/preview?code=ABC123
// Returns public room info for the join landing page (no auth required)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.toUpperCase();

  if (!code || code.length !== 6) {
    return NextResponse.json(
      { error: "Invalid share code" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Fetch room by share code (public info only)
  const { data: room, error } = await supabase
    .from("rooms")
    .select(`
      id,
      name,
      sport,
      game_data,
      is_active,
      expires_at,
      room_members(count)
    `)
    .eq("share_code", code)
    .single();

  if (error || !room) {
    return NextResponse.json(
      { error: "Watch party not found. Check your code and try again." },
      { status: 404 }
    );
  }

  // Check if room is expired
  if (new Date(room.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "This watch party has expired." },
      { status: 410 }
    );
  }

  // Check if room is active
  if (!room.is_active) {
    return NextResponse.json(
      { error: "This watch party is no longer active." },
      { status: 410 }
    );
  }

  // Return safe public preview data
  return NextResponse.json({
    id: room.id,
    name: room.name,
    sport: room.sport,
    game_data: {
      home_team: room.game_data?.home_team || "Home Team",
      away_team: room.game_data?.away_team || "Away Team",
      home_abbrev: room.game_data?.home_abbrev,
      away_abbrev: room.game_data?.away_abbrev,
      status: room.game_data?.status,
      start_time: room.game_data?.start_time,
    },
    member_count: room.room_members?.[0]?.count || 0,
    is_active: room.is_active,
    expires_at: room.expires_at,
  });
}
