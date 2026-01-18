import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateShareCode } from "@/lib/share-code";
import { getInitialPosition } from "@/lib/game-position";
import { getInitialEncodedPosition } from "@/lib/position-encoding";
import type { GameData } from "@/lib/database.types";

// POST /api/rooms - Create a new room
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

    // Don't allow anonymous users to create rooms
    if (user.is_anonymous) {
      return NextResponse.json(
        { error: "Guests cannot create rooms. Please sign in first." },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { game_id, sport, game_data, name } = body;

    // Validate required fields
    if (!game_id || !sport) {
      return NextResponse.json(
        { error: "Missing required fields: game_id, sport" },
        { status: 400 }
      );
    }

    // Validate name if provided
    if (name !== undefined && name !== null) {
      if (typeof name !== "string") {
        return NextResponse.json(
          { error: "Name must be a string" },
          { status: 400 }
        );
      }
      if (name.trim().length > 100) {
        return NextResponse.json(
          { error: "Name must be 100 characters or less" },
          { status: 400 }
        );
      }
    }

    // Validate sport
    const validSports = ["nfl", "mlb", "nba", "nhl", "cfb"];
    if (!validSports.includes(sport)) {
      return NextResponse.json(
        { error: "Invalid sport. Must be: nfl, mlb, nba, nhl, or cfb" },
        { status: 400 }
      );
    }

    // Generate unique share code (retry if collision)
    let shareCode = generateShareCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from("rooms")
        .select("id")
        .eq("share_code", shareCode)
        .single();

      if (!existing) break; // Code is unique
      shareCode = generateShareCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: "Failed to generate unique share code. Please try again." },
        { status: 500 }
      );
    }

    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create room
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({
        game_id,
        sport,
        share_code: shareCode,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
        game_data: game_data as GameData,
        is_active: true,
        name: name?.trim() || null,
      })
      .select()
      .single();

    if (roomError) {
      console.error("Error creating room:", roomError);
      return NextResponse.json(
        { error: "Failed to create room" },
        { status: 500 }
      );
    }

    // Add creator as first member
    const initialPosition = getInitialPosition(
      sport as "nfl" | "mlb" | "nba" | "nhl" | "cfb"
    );
    const initialPositionEncoded = getInitialEncodedPosition(
      sport as "nfl" | "mlb" | "nba" | "nhl" | "cfb"
    );

    // Get display name from email
    const displayName = user.email?.split("@")[0] || null;

    const { error: memberError } = await supabase.from("room_members").insert({
      room_id: room.id,
      user_id: user.id,
      current_position: initialPosition,
      current_position_encoded: initialPositionEncoded,
      show_spoilers: true, // Default: extra spoiler protection OFF (show all markers)
      display_name: displayName,
    });

    if (memberError) {
      console.error("Error adding member:", memberError);
      // Room was created but member add failed - clean up
      await supabase.from("rooms").delete().eq("id", room.id);
      return NextResponse.json(
        { error: "Failed to join room" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        room,
        share_code: shareCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error creating room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/rooms - Get user's rooms
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

    // Get rooms where user is a member
    const { data: memberships, error: memberError } = await supabase
      .from("room_members")
      .select("room_id")
      .eq("user_id", user.id);

    if (memberError) {
      console.error("Error fetching memberships:", memberError);
      return NextResponse.json(
        { error: "Failed to fetch rooms" },
        { status: 500 }
      );
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ rooms: [] });
    }

    const roomIds = memberships.map((m) => m.room_id);

    // Get room details
    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("*")
      .in("id", roomIds)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (roomsError) {
      console.error("Error fetching rooms:", roomsError);
      return NextResponse.json(
        { error: "Failed to fetch rooms" },
        { status: 500 }
      );
    }

    return NextResponse.json({ rooms: rooms || [] });
  } catch (error) {
    console.error("Unexpected error fetching rooms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
