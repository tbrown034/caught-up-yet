"use client";

import type { Message } from "@/lib/database.types";
import { formatGamePosition, isMessageVisible } from "@/lib/game-position";
import type { GamePosition } from "@/lib/database.types";

interface MessageFeedProps {
  messages: Message[];
  currentPosition: GamePosition;
  sport: "nfl" | "mlb" | "nba" | "nhl";
  showSpoilers: boolean;
  currentUserId: string;
}

export default function MessageFeed({
  messages,
  currentPosition,
  sport,
  showSpoilers,
  currentUserId,
}: MessageFeedProps) {
  // Filter messages based on spoiler settings
  const filteredMessages = showSpoilers
    ? messages
    : messages.filter((msg) =>
        isMessageVisible(msg.position as GamePosition, currentPosition, sport)
      );

  const hiddenCount = messages.length - filteredMessages.length;

  if (messages.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hidden messages indicator */}
      {!showSpoilers && hiddenCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>{hiddenCount}</strong> message
            {hiddenCount === 1 ? "" : "s"} hidden (ahead of your position)
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-3">
        {filteredMessages.map((msg) => {
          const isOwnMessage = msg.user_id === currentUserId;
          const positionLabel = formatGamePosition(
            msg.position as GamePosition,
            sport
          );

          return (
            <div
              key={msg.id}
              className={`border rounded-lg p-4 ${
                isOwnMessage
                  ? "bg-blue-50 border-blue-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-semibold text-gray-500">
                  {isOwnMessage ? "You" : `User ${msg.user_id.slice(0, 8)}`}
                </p>
                <p className="text-xs text-gray-500">{positionLabel}</p>
              </div>
              <p className="text-gray-900">{msg.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(msg.created_at).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
