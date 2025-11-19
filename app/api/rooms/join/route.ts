import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeShareCode, isValidShareCode } from "@/lib/share-code";
import { getInitialPosition } from "@/lib/game-position";
import { getInitialEncodedPosition } from "@/lib/position-encoding";

// POST /api/rooms/join - Join a room by share code
export async function POST(request: Request) {
  console.log('[JOIN] ========== JOIN REQUEST START ==========');
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('[JOIN] Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      isAnonymous: user?.is_anonymous,
      authError: authError?.message
    });

    if (authError || !user) {
      console.log('[JOIN] Auth failed, returning 401');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { share_code, display_name } = body;

    console.log('[JOIN] Request body:', { share_code, display_name, hasDisplayName: !!display_name });

    if (!share_code) {
      console.log('[JOIN] Missing share code, returning 400');
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
        console.log('[JOIN] Guest missing display name, returning 400');
        return NextResponse.json(
          { error: "Display name is required for guests" },
          { status: 400 }
        );
      }
      memberDisplayName = display_name;
    } else {
      memberDisplayName = user.email?.split("@")[0] || null;
    }

    console.log('[JOIN] Display name determined:', { memberDisplayName, isAnonymous });

    // Normalize and validate share code
    const normalizedCode = normalizeShareCode(share_code);

    console.log('[JOIN] Share code normalized:', { original: share_code, normalized: normalizedCode });

    if (!isValidShareCode(normalizedCode)) {
      console.log('[JOIN] Invalid share code format, returning 400');
      return NextResponse.json(
        { error: "Invalid share code format" },
        { status: 400 }
      );
    }

    // Find room by share code
    // Note: We use order + limit instead of .single() to handle duplicate codes gracefully
    // This takes the most recently created active room with this code
    console.log('[JOIN] Looking for room with code:', normalizedCode);
    const { data: rooms, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("share_code", normalizedCode)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);

    const room = rooms?.[0];
    console.log('[JOIN] Room query result:', { found: !!room, count: rooms?.length, error: roomError?.message });

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
          console.log('[JOIN] Room expired:', normalizedCode, 'expired at:', anyRoom.expires_at);
          return NextResponse.json(
            { error: "This watch party has expired. Create a new one to continue." },
            { status: 410 }
          );
        }

        // Not active for some other reason
        console.log('[JOIN] Room not active:', normalizedCode, 'is_active:', anyRoom.is_active);
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
    console.log('[JOIN] Checking expiration:', {
      expiresAt: room.expires_at,
      now: new Date().toISOString(),
      isExpired: new Date(room.expires_at) < new Date()
    });

    if (new Date(room.expires_at) < new Date()) {
      console.log('[JOIN] Room expired, returning 410');
      return NextResponse.json(
        { error: "This room has expired" },
        { status: 410 }
      );
    }

    // Check if user is already a member
    console.log('[JOIN] Checking existing membership...');
    const { data: existingMember } = await supabase
      .from("room_members")
      .select("*")
      .eq("room_id", room.id)
      .eq("user_id", user.id)
      .single();

    console.log('[JOIN] Existing member check:', { isExistingMember: !!existingMember });

    if (existingMember) {
      // User already in room, just return room info
      console.log('[JOIN] User already a member, returning room');
      return NextResponse.json({
        room,
        already_member: true,
      });
    }

    // Add user as member
    console.log('[JOIN] Adding user as new member...');
    const initialPosition = getInitialPosition(
      room.sport as "nfl" | "mlb" | "nba" | "nhl"
    );
    const initialPositionEncoded = getInitialEncodedPosition(
      room.sport as "nfl" | "mlb" | "nba" | "nhl"
    );

    console.log('[JOIN] Initial position:', { sport: room.sport, position: initialPosition, encoded: initialPositionEncoded });

    const { error: memberError } = await supabase.from("room_members").insert({
      room_id: room.id,
      user_id: user.id,
      current_position: initialPosition,
      current_position_encoded: initialPositionEncoded,
      show_spoilers: true, // Default: extra spoiler protection OFF (show all markers)
      display_name: memberDisplayName,
    });

    if (memberError) {
      console.error("[JOIN] Error inserting member:", memberError);
      return NextResponse.json(
        { error: "Failed to join room" },
        { status: 500 }
      );
    }

    console.log('[JOIN] ========== JOIN SUCCESS ==========');
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
