import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeShareCode, isValidShareCode } from "@/lib/share-code";
import { getInitialPosition } from "@/lib/game-position";

// POST /api/rooms/join - Join a room by share code
export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json();
    const { share_code } = body;

    if (!share_code) {
      return NextResponse.json(
        { error: "Share code is required" },
        { status: 400 }
      );
    }

    // Normalize and validate share code
    const normalizedCode = normalizeShareCode(share_code);
    if (!isValidShareCode(normalizedCode)) {
      return NextResponse.json(
        { error: "Invalid share code format" },
        { status: 400 }
      );
    }

    // Find room by share code
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("share_code", normalizedCode)
      .eq("is_active", true)
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { error: "Room not found. Check your code and try again." },
        { status: 404 }
      );
    }

    // Check if room has expired
    if (new Date(room.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This room has expired" },
        { status: 410 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("room_members")
      .select("*")
      .eq("room_id", room.id)
      .eq("user_id", user.id)
      .single();

    if (existingMember) {
      // User already in room, just return room info
      return NextResponse.json({
        room,
        already_member: true,
      });
    }

    // Add user as member
    const initialPosition = getInitialPosition(
      room.sport as "nfl" | "mlb" | "nba" | "nhl"
    );

    const { error: memberError } = await supabase.from("room_members").insert({
      room_id: room.id,
      user_id: user.id,
      current_position: initialPosition,
      show_spoilers: false,
    });

    if (memberError) {
      console.error("Error joining room:", memberError);
      return NextResponse.json(
        { error: "Failed to join room" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      room,
      already_member: false,
    });
  } catch (error) {
    console.error("Unexpected error joining room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
