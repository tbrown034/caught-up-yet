"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Users, Share2 } from "lucide-react";
import type {
  Room,
  Message,
  GamePosition,
  NflPosition,
  GameData,
} from "@/lib/database.types";
import NflPositionSlider from "@/components/rooms/NflPositionSlider";
import MessageFeed from "@/components/rooms/MessageFeed";
import MessageComposer from "@/components/rooms/MessageComposer";
import { formatShareCode } from "@/lib/share-code";
import { createClient } from "@/lib/supabase/client";

export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPosition, setCurrentPosition] = useState<GamePosition | null>(
    null
  );
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch room data
  const fetchRoomData = async () => {
    try {
      const response = await fetch(`/api/rooms/${id}`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (response.status === 403) {
          setError("You are not a member of this room");
          return;
        }
        throw new Error("Failed to load room");
      }

      const data = await response.json();
      setRoom(data.room);
      setMessages(data.messages || []);
      setCurrentPosition(data.current_user_position);
      setShowSpoilers(data.show_spoilers);
      setMemberCount(data.members?.length || 0);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching room:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load watch party"
      );
      setIsLoading(false);
    }
  };

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      }
    });
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRoomData();
  }, [id]);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchRoomData, 10000);
    return () => clearInterval(interval);
  }, [id]);

  // Update position
  const handlePositionChange = async (newPosition: GamePosition) => {
    setCurrentPosition(newPosition);

    try {
      const response = await fetch("/api/members/position", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: id,
          position: newPosition,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update position");
      }
    } catch (err) {
      console.error("Error updating position:", err);
    }
  };

  // Toggle spoilers
  const handleToggleSpoilers = async () => {
    const newValue = !showSpoilers;
    setShowSpoilers(newValue);

    try {
      const response = await fetch("/api/members/position", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: id,
          show_spoilers: newValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update spoiler setting");
      }
    } catch (err) {
      console.error("Error updating spoiler setting:", err);
      setShowSpoilers(!newValue); // Revert on error
    }
  };

  // Copy share code
  const handleCopyShareCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.share_code);
      // Could add toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading watch party...</p>
      </div>
    );
  }

  if (error || !room || !currentPosition) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-semibold mb-4">
            {error || "Failed to load watch party"}
          </p>
          <button
            onClick={() => router.push("/games")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  const gameData = room.game_data as GameData;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {gameData?.awayTeam} @ {gameData?.homeTeam}
              </h1>
              <p className="text-sm text-gray-600">
                {room.sport.toUpperCase()} Watch Party
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                  {memberCount} {memberCount === 1 ? "member" : "members"}
                </span>
              </div>
              <button
                onClick={handleCopyShareCode}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Share2 className="w-4 h-4" />
                {formatShareCode(room.share_code)}
              </button>
            </div>
          </div>

          {/* Spoiler Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Spoiler Protection</p>
              <p className="text-xs text-gray-600">
                {showSpoilers
                  ? "Showing all messages (spoilers visible)"
                  : "Hiding messages ahead of your position"}
              </p>
            </div>
            <button
              onClick={handleToggleSpoilers}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showSpoilers ? "bg-gray-400" : "bg-blue-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showSpoilers ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Position Slider (NFL only for now) */}
        {room.sport === "nfl" && (
          <NflPositionSlider
            position={currentPosition as NflPosition}
            onChange={handlePositionChange}
          />
        )}

        {/* Message Composer */}
        {userId && (
          <MessageComposer
            roomId={id}
            currentPosition={currentPosition}
            sport={room.sport as "nfl" | "mlb" | "nba" | "nhl"}
            onMessageSent={fetchRoomData}
          />
        )}

        {/* Messages */}
        {userId && (
          <MessageFeed
            messages={messages}
            currentPosition={currentPosition}
            sport={room.sport as "nfl" | "mlb" | "nba" | "nhl"}
            showSpoilers={showSpoilers}
            currentUserId={userId}
          />
        )}
      </div>
    </div>
  );
}
