import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

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

    // Check if room has expired
    if (new Date(room.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This room has expired" },
        { status: 410 }
      );
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

    // Get messages with sender display names
    // We need to join with room_members to get the display_name for each message sender
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("room_id", id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
    }

    // Get all reactions for these messages
    const messageIds = (messages || []).map(m => m.id);
    const { data: reactions, error: reactionsError } = await supabase
      .from("message_reactions")
      .select("*, room_members!inner(display_name)")
      .in("message_id", messageIds);

    if (reactionsError) {
      console.error("Error fetching reactions:", reactionsError);
    }

    // Group reactions by message and type
    const reactionsByMessage = (reactions || []).reduce((acc, reaction) => {
      if (!acc[reaction.message_id]) {
        acc[reaction.message_id] = {
          thumbs_up: [],
          thumbs_down: [],
          question: [],
          exclamation: []
        };
      }
      acc[reaction.message_id][reaction.reaction_type].push({
        user_id: reaction.user_id,
        display_name: reaction.room_members.display_name,
        is_current_user: reaction.user_id === user.id
      });
      return acc;
    }, {} as Record<string, any>);

    // Enrich messages with display names and reactions
    const enrichedMessages = (messages || []).map((msg) => {
      const sender = members?.find((m) => m.user_id === msg.user_id);
      // Fallback chain: display_name -> "Member" (better than "Guest" for signed-in users)
      return {
        ...msg,
        sender_display_name: sender?.display_name || "Member",
        reactions: reactionsByMessage[msg.id] || {
          thumbs_up: [],
          thumbs_down: [],
          question: [],
          exclamation: []
        }
      };
    });

    return NextResponse.json({
      room,
      members: members || [],
      messages: enrichedMessages,
      current_user_position: membership.current_position,
      current_user_position_encoded: membership.current_position_encoded,
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

// PATCH /api/rooms/[id] - Update room (e.g., rename)
export async function PATCH(
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

    // Get room to verify ownership
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", id)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Only creator can update room
    if (room.created_by !== user.id) {
      return NextResponse.json(
        { error: "Only the room creator can update this room" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name } = body;

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

    // Update room
    const { data: updatedRoom, error: updateError } = await supabase
      .from("rooms")
      .update({ name: name?.trim() || null })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating room:", updateError);
      return NextResponse.json(
        { error: "Failed to update room" },
        { status: 500 }
      );
    }

    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    console.error("Unexpected error updating room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/rooms/[id] - Delete room
export async function DELETE(
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

    // Get room to verify ownership
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", id)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Only creator or admin can delete room
    const userIsAdmin = isAdmin(user.email);
    if (room.created_by !== user.id && !userIsAdmin) {
      return NextResponse.json(
        { error: "Only the room creator can delete this room" },
        { status: 403 }
      );
    }

    // Delete room (cascade will handle members and messages via DB constraints)
    const { error: deleteError } = await supabase
      .from("rooms")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting room:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete room" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error deleting room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
