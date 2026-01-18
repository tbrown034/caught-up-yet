import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeShareCode, isValidShareCode } from "@/lib/share-code";
import { getInitialPosition } from "@/lib/game-position";
import { getInitialEncodedPosition } from "@/lib/position-encoding";

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
    const { share_code, display_name } = body;

    if (!share_code) {
      return NextResponse.json(
        { error: "Share code is required" },
        { status: 400 }
      );
    }

    // Determine display name
    // For authenticated users, use email; for guests, use provided name
    const isAnonymous = user.is_anonymous;
    let memberDisplayName: string | null = null;

    if (isAnonymous) {
      if (!display_name) {
        return NextResponse.json(
          { error: "Display name is required for guests" },
          { status: 400 }
        );
      }
      if (typeof display_name !== "string" || display_name.trim().length > 50) {
        return NextResponse.json(
          { error: "Display name must be 50 characters or less" },
          { status: 400 }
        );
      }
      memberDisplayName = display_name.trim();
    } else {
      memberDisplayName = user.email?.split("@")[0] || null;
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
    // Note: We use order + limit instead of .single() to handle duplicate codes gracefully
    // This takes the most recently created active room with this code
    const { data: rooms, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("share_code", normalizedCode)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);

    const room = rooms?.[0];

    if (roomError || !room) {
      // Try to find ANY room with this code (ignore is_active) to give better error
      const { data: anyRooms } = await supabase
        .from("rooms")
        .select("*")
        .eq("share_code", normalizedCode)
        .order("created_at", { ascending: false })
        .limit(1);

      const anyRoom = anyRooms?.[0];

      if (anyRoom) {
        // Check if expired
        if (new Date(anyRoom.expires_at) < new Date()) {
          return NextResponse.json(
            { error: "This watch party has expired. Create a new one to continue." },
            { status: 410 }
          );
        }

        // Not active for some other reason
        return NextResponse.json(
          { error: "This watch party is no longer active." },
          { status: 410 }
        );
      }
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
      room.sport as "nfl" | "mlb" | "nba" | "nhl" | "cfb"
    );
    const initialPositionEncoded = getInitialEncodedPosition(
      room.sport as "nfl" | "mlb" | "nba" | "nhl" | "cfb"
    );

    const { error: memberError } = await supabase.from("room_members").insert({
      room_id: room.id,
      user_id: user.id,
      current_position: initialPosition,
      current_position_encoded: initialPositionEncoded,
      show_spoilers: true, // Default: extra spoiler protection OFF (show all markers)
      display_name: memberDisplayName,
    });

    if (memberError) {
      console.error("Error inserting member:", memberError);
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
