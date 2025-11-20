import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidPosition } from "@/lib/game-position";
import { encodePosition, decodePosition } from "@/lib/position-encoding";

// POST /api/messages - Send a message in a room
export async function POST(request: Request) {
  console.log('[API/MESSAGES] POST request received');
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('[API/MESSAGES] Auth failed:', authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('[API/MESSAGES] User authenticated:', user.id);

    // Parse request body
    const body = await request.json();
    const { room_id, content, position, position_encoded } = body;

    console.log('[API/MESSAGES] Request data:', { room_id, content, position_encoded });

    // Validate required fields - accept either position (JSONB) or position_encoded (integer)
    if (!room_id || !content || (position === undefined && position_encoded === undefined)) {
      return NextResponse.json(
        { error: "Missing required fields: room_id, content, and (position or position_encoded)" },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length > 500) {
      return NextResponse.json(
        { error: "Message too long (max 500 characters)" },
        { status: 400 }
      );
    }

    // Get room to validate membership and sport
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("sport")
      .eq("id", room_id)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const sport = room.sport as "nfl" | "mlb" | "nba" | "nhl";

    // Check if user is a member
    const { data: membership, error: membershipError } = await supabase
      .from("room_members")
      .select("user_id")
      .eq("room_id", room_id)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: "You are not a member of this room" },
        { status: 403 }
      );
    }

    // Determine position data - support both formats
    let positionJsonb = position;
    let positionInt = position_encoded;

    if (position_encoded !== undefined && position === undefined) {
      // Only encoded position provided - decode to JSONB for storage
      positionJsonb = decodePosition(position_encoded, sport);
      positionInt = position_encoded;
    } else if (position !== undefined) {
      // JSONB position provided - validate and encode
      if (!isValidPosition(position, sport)) {
        return NextResponse.json(
          { error: "Invalid position format for this sport" },
          { status: 400 }
        );
      }
      positionJsonb = position;
      positionInt = encodePosition(position, sport);
    }

    // Create message with both position formats
    console.log('[API/MESSAGES] Creating message with:', {
      room_id,
      user_id: user.id,
      content: content.trim(),
      position: positionJsonb,
      position_encoded: positionInt,
    });

    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        room_id,
        user_id: user.id,
        content: content.trim(),
        position: positionJsonb,
        position_encoded: positionInt,
      })
      .select()
      .single();

    if (messageError) {
      console.error("[API/MESSAGES] Error creating message:", messageError);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    console.log('[API/MESSAGES] Message created successfully:', message.id);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
