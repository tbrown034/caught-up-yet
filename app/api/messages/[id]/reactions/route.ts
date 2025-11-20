import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/messages/[id]/reactions - Toggle a reaction on a message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params;
    console.log('[API/REACTIONS] POST request for message:', messageId);
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('[API/REACTIONS] Auth failed:', authError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('[API/REACTIONS] User authenticated:', user.id);

    // Parse request body
    const body = await request.json();
    const { reaction_type } = body;

    console.log('[API/REACTIONS] Reaction type:', reaction_type);

    // Validate reaction type
    const validReactions = ['thumbs_up', 'thumbs_down', 'question', 'exclamation'];
    if (!reaction_type || !validReactions.includes(reaction_type)) {
      return NextResponse.json(
        { error: "Invalid reaction type" },
        { status: 400 }
      );
    }

    // Check if message exists and user is a member of the room
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .select("room_id")
      .eq("id", messageId)
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Check if reaction already exists
    const { data: existingReaction } = await supabase
      .from("message_reactions")
      .select("id")
      .eq("message_id", messageId)
      .eq("user_id", user.id)
      .eq("reaction_type", reaction_type)
      .single();

    if (existingReaction) {
      // Remove reaction (toggle off)
      console.log('[API/REACTIONS] Removing existing reaction:', existingReaction.id);
      const { error: deleteError } = await supabase
        .from("message_reactions")
        .delete()
        .eq("id", existingReaction.id);

      if (deleteError) {
        console.error("[API/REACTIONS] Error removing reaction:", deleteError);
        return NextResponse.json(
          { error: "Failed to remove reaction" },
          { status: 500 }
        );
      }

      console.log('[API/REACTIONS] Reaction removed successfully');
      return NextResponse.json({ action: "removed", reaction_type });
    } else {
      // Add reaction (toggle on)
      console.log('[API/REACTIONS] Adding new reaction');
      const { error: insertError } = await supabase
        .from("message_reactions")
        .insert({
          message_id: messageId,
          user_id: user.id,
          reaction_type,
        });

      if (insertError) {
        console.error("[API/REACTIONS] Error adding reaction:", insertError);
        return NextResponse.json(
          { error: "Failed to add reaction" },
          { status: 500 }
        );
      }

      console.log('[API/REACTIONS] Reaction added successfully');
      return NextResponse.json({ action: "added", reaction_type });
    }
  } catch (error) {
    console.error("Unexpected error toggling reaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
