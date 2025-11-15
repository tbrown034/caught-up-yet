import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidPosition } from "@/lib/game-position";

// POST /api/messages - Send a message in a room
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
    const { room_id, content, position } = body;

    // Validate required fields
    if (!room_id || !content || !position) {
      return NextResponse.json(
        { error: "Missing required fields: room_id, content, position" },
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

    // Validate position
    if (
      !isValidPosition(position, room.sport as "nfl" | "mlb" | "nba" | "nhl")
    ) {
      return NextResponse.json(
        { error: "Invalid position format for this sport" },
        { status: 400 }
      );
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        room_id,
        user_id: user.id,
        content: content.trim(),
        position,
      })
      .select()
      .single();

    if (messageError) {
      console.error("Error creating message:", messageError);
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
