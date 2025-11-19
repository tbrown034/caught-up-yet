import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/messages/[id]/reactions - Toggle a reaction on a message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params;
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
    const { reaction_type } = body;

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
      const { error: deleteError } = await supabase
        .from("message_reactions")
        .delete()
        .eq("id", existingReaction.id);

      if (deleteError) {
        console.error("Error removing reaction:", deleteError);
        return NextResponse.json(
          { error: "Failed to remove reaction" },
          { status: 500 }
        );
      }

      return NextResponse.json({ action: "removed", reaction_type });
    } else {
      // Add reaction (toggle on)
      const { error: insertError } = await supabase
        .from("message_reactions")
        .insert({
          message_id: messageId,
          user_id: user.id,
          reaction_type,
        });

      if (insertError) {
        console.error("Error adding reaction:", insertError);
        return NextResponse.json(
          { error: "Failed to add reaction" },
          { status: 500 }
        );
      }

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
