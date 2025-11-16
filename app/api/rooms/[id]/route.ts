import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/rooms/[id] - Get room details with members and messages
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get room details
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", id)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if user is a member
    const { data: membership, error: membershipError } = await supabase
      .from("room_members")
      .select("*")
      .eq("room_id", id)
      .eq("user_id", user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: "You are not a member of this room" },
        { status: 403 }
      );
    }

    // Get all members
    const { data: members, error: membersError } = await supabase
      .from("room_members")
      .select("*")
      .eq("room_id", id);

    if (membersError) {
      console.error("Error fetching members:", membersError);
    }

    // Get messages with author profiles
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(`
        *,
        profiles!inner(display_name)
      `)
      .eq("room_id", id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
    }

    // Transform messages to include author_name
    const messagesWithAuthors = messages?.map(msg => ({
      ...msg,
      author_name: (msg as any).profiles?.display_name
    })) || [];

    return NextResponse.json({
      room,
      members: members || [],
      messages: messagesWithAuthors,
      current_user_position: membership.current_position,
      show_spoilers: membership.show_spoilers,
    });
  } catch (error) {
    console.error("Unexpected error fetching room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
