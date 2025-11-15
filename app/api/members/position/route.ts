import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidPosition } from "@/lib/game-position";

// PATCH /api/members/position - Update user's position in a room
export async function PATCH(request: Request) {
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
    const { room_id, position, show_spoilers } = body;

    if (!room_id) {
      return NextResponse.json(
        { error: "room_id is required" },
        { status: 400 }
      );
    }

    // Get room to validate sport
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("sport")
      .eq("id", room_id)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Validate position if provided
    if (position !== undefined) {
      if (
        !isValidPosition(position, room.sport as "nfl" | "mlb" | "nba" | "nhl")
      ) {
        return NextResponse.json(
          { error: "Invalid position format for this sport" },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updates: {
      current_position?: unknown;
      show_spoilers?: boolean;
    } = {};

    if (position !== undefined) {
      updates.current_position = position;
    }

    if (show_spoilers !== undefined) {
      updates.show_spoilers = show_spoilers;
    }

    // Update member position
    const { data: member, error: updateError } = await supabase
      .from("room_members")
      .update(updates)
      .eq("room_id", room_id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating position:", updateError);
      return NextResponse.json(
        { error: "Failed to update position" },
        { status: 500 }
      );
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Unexpected error updating position:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
