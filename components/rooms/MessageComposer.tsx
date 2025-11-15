"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { GamePosition } from "@/lib/database.types";
import { formatGamePosition } from "@/lib/game-position";

interface MessageComposerProps {
  roomId: string;
  currentPosition: GamePosition;
  sport: "nfl" | "mlb" | "nba" | "nhl";
  onMessageSent: () => void;
}

export default function MessageComposer({
  roomId,
  currentPosition,
  sport,
  onMessageSent,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: roomId,
          content: content.trim(),
          position: currentPosition,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send message");
      }

      setContent("");
      onMessageSent();
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const positionLabel = formatGamePosition(currentPosition, sport);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Send a message
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Posting at: <strong>{positionLabel}</strong>
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your reaction..."
              maxLength={500}
              disabled={isSending}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!content.trim() || isSending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">
            {content.length}/500
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
}
