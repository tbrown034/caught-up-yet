"use client";

import { use, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, Users, MessageCircle, Crown, Edit2, Trash2, X, Check, Radio } from "lucide-react";
import type { Room, Message, GameData, RoomMember, GameStatus } from "@/lib/database.types";
import { encodePosition, isPositionVisible } from "@/lib/position-encoding";
import { formatGamePosition } from "@/lib/game-position";
import BoxScorePosition from "@/components/rooms/BoxScorePosition";
import { createClient } from "@/lib/supabase/client";
import ShareMenu from "@/components/rooms/ShareMenu";
import { debounce } from "@/lib/utils";
import { calculateLivePosition } from "@/lib/live-position";
import type { ScoringPlay } from "@/lib/score-at-position";
import { getScoreAtPosition, isGameLive as checkIfGameLive } from "@/lib/score-at-position";
import { fetchGameScoringPlays, fetchGameStatus } from "@/lib/espn-api";

interface ReactionUser {
  user_id: string;
  display_name: string;
  is_current_user: boolean;
}

interface MessageReactions {
  thumbs_up: ReactionUser[];
  thumbs_down: ReactionUser[];
  question: ReactionUser[];
  exclamation: ReactionUser[];
}

interface ExtendedMessage extends Message {
  position_encoded?: number;
  sender_display_name?: string | null;
  reactions?: MessageReactions;
}

interface ExtendedMember extends RoomMember {
  display_name?: string | null;
}

export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [members, setMembers] = useState<ExtendedMember[]>([]);
  const [currentPositionEncoded, setCurrentPositionEncoded] = useState<number>(0);
  const [showSpoilers, setShowSpoilers] = useState(true); // Default: OFF (true = show all markers)
  const [memberCount, setMemberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Someone");
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [livePositionEncoded, setLivePositionEncoded] = useState<number | null>(null);
  const [scoringPlays, setScoringPlays] = useState<ScoringPlay[]>([]);
  const [gameStatus, setGameStatus] = useState<string | null>(null);

  // Fetch room data
  const fetchRoomData = useCallback(async () => {
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
      setMembers(data.members || []);
      setShowSpoilers(data.show_spoilers);
      setMemberCount(data.members?.length || 0);

      // Handle position - prefer encoded, fallback to JSONB conversion
      if (data.current_user_position_encoded !== undefined) {
        setCurrentPositionEncoded(data.current_user_position_encoded);
      } else if (data.current_user_position && data.room) {
        // Convert JSONB to encoded for backward compatibility
        const encoded = encodePosition(
          data.current_user_position,
          data.room.sport as "nfl" | "mlb" | "nba" | "nhl"
        );
        setCurrentPositionEncoded(encoded);
      }

      // Calculate live position from game status
      if (data.room?.game_data?.status) {
        const gameStatusObj = typeof data.room.game_data.status === "string"
          ? { type: data.room.game_data.status }
          : data.room.game_data.status as GameStatus;

        // Set game status for UI display
        setGameStatus(gameStatusObj.type);

        const livePos = calculateLivePosition(
          gameStatusObj,
          data.room.sport as "nfl" | "mlb" | "nba" | "nhl"
        );
        setLivePositionEncoded(livePos);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching room:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load watch party"
      );
      setIsLoading(false);
    }
  }, [id, router]);

  // Get current user ID and name
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        if (user.email) {
          setUserName(user.email.split("@")[0]);
        }
      }
    });
  }, [supabase.auth]);

  // Initial fetch
  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

  // Fetch and cache scoring plays for smart score calculation
  useEffect(() => {
    if (!room) return;

    const fetchPlays = async () => {
      try {
        const sport = room.sport as "nfl" | "mlb" | "nba" | "nhl";

        // Fetch scoring plays from ESPN API using room.game_id
        const plays = await fetchGameScoringPlays(room.game_id, sport);
        setScoringPlays(plays);
      } catch (error) {
        console.error("Error fetching scoring plays:", error);
      }
    };

    // Initial fetch
    fetchPlays();

    // If game is live, refresh scoring plays every 60 seconds
    const gameData = room.game_data as GameData;
    if (gameData?.status) {
      const statusType = typeof gameData.status === 'string'
        ? gameData.status
        : gameData.status.type;

      if (checkIfGameLive(statusType)) {
        const interval = setInterval(fetchPlays, 60000); // 60 seconds
        return () => clearInterval(interval);
      }
    }
  }, [room]);

  // Fetch live game status from ESPN API periodically
  useEffect(() => {
    if (!room) return;

    const updateLiveStatus = async () => {
      try {
        const sport = room.sport as "nfl" | "mlb" | "nba" | "nhl";

        // Fetch current game status from ESPN
        const freshStatus = await fetchGameStatus(room.game_id, sport);

        if (freshStatus) {
          // Update game status for UI
          setGameStatus(freshStatus.type);

          // Calculate new live position
          const gameStatusObj: GameStatus = {
            type: freshStatus.type,
            displayClock: freshStatus.displayClock,
            period: freshStatus.period,
          };

          const livePos = calculateLivePosition(gameStatusObj, sport);
          setLivePositionEncoded(livePos);
        }
      } catch (error) {
        console.error("Error fetching live game status:", error);
      }
    };

    // Initial fetch
    updateLiveStatus();

    // Refresh every 30 seconds for all games (will show live position when game starts)
    const interval = setInterval(updateLiveStatus, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [room]);

  // Realtime subscriptions for messages and room updates
  useEffect(() => {
    const channel = supabase
      .channel(`room-${id}`)
      // Postgres Changes: Listen for new messages (persistent)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${id}`,
        },
        (payload) => {
          // Add new message to state with sender display name
          const newMessage = payload.new as ExtendedMessage;

          // Enrich with sender display name and empty reactions from members
          setMembers((currentMembers) => {
            const sender = currentMembers.find((m) => m.user_id === newMessage.user_id);
            const enrichedMessage: ExtendedMessage = {
              ...newMessage,
              sender_display_name: sender?.display_name || "Member",
              reactions: {
                thumbs_up: [],
                thumbs_down: [],
                question: [],
                exclamation: [],
              },
            };

            // Deduplicate: only add if not already in messages
            setMessages((prev) => {
              const exists = prev.some((msg) => msg.id === enrichedMessage.id);
              if (exists) return prev;
              return [...prev, enrichedMessage];
            });
            return currentMembers; // Don't change members
          });
        }
      )
      // Postgres Changes: Listen for room updates (persistent)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          // Update room data (e.g., name changes, game status updates)
          setRoom(payload.new as Room);

          // Recalculate live position if game status changed
          const newRoom = payload.new as Room;
          if (newRoom.game_data) {
            const gameData = newRoom.game_data as GameData;
            if (gameData.status) {
              const gameStatus = typeof gameData.status === "string"
                ? { type: gameData.status }
                : gameData.status as GameStatus;

              const livePos = calculateLivePosition(
                gameStatus,
                newRoom.sport as "nfl" | "mlb" | "nba" | "nhl"
              );
              setLivePositionEncoded(livePos);
            }
          }
        }
      )
      // Postgres Changes: Listen for member changes (persistent)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_members",
          filter: `room_id=eq.${id}`,
        },
        () => {
          // Refetch members when membership changes
          fetchRoomData();
        }
      )
      // Postgres Changes: Listen for reaction changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
        },
        () => {
          // Refetch room data when reactions change
          // This will update all messages with new reaction counts
          fetchRoomData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, supabase, fetchRoomData]);

  // Debounced DB save for position (every 30 seconds for recovery/persistence)
  const savePositionToDB = useRef(
    debounce(async (roomId: string, positionEncoded: number) => {
      try {
        const response = await fetch("/api/members/position", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_id: roomId,
            position_encoded: positionEncoded,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update position");
        }
      } catch (err) {
        console.error("Error updating position:", err);
      }
    }, 30000) // 30 seconds - sparse saves for recovery only
  ).current;

  // Update position with sparse DB saves
  const handlePositionChange = useCallback(
    (newPositionEncoded: number) => {
      // 1. Update UI immediately for responsive feel
      setCurrentPositionEncoded(newPositionEncoded);

      // 2. Debounce DB save (every 30s for recovery/persistence)
      savePositionToDB(id, newPositionEncoded);
    },
    [id, savePositionToDB]
  );

  // Jump to live position
  const handleGoLive = useCallback(() => {
    if (livePositionEncoded !== null) {
      handlePositionChange(livePositionEncoded);
    }
  }, [livePositionEncoded, handlePositionChange]);

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


  // Start editing room name
  const handleStartEdit = () => {
    setEditedName(room?.name || "");
    setIsEditing(true);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName("");
  };

  // Save room name
  const handleSaveName = async () => {
    if (!room) return;

    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editedName.trim() || null }),
      });

      if (!response.ok) {
        throw new Error("Failed to update room name");
      }

      const data = await response.json();
      setRoom(data.room);
      setIsEditing(false);
      setEditedName("");
    } catch (err) {
      console.error("Error updating room name:", err);
      alert("Failed to update room name. Please try again.");
    }
  };

  // Delete room
  const handleDeleteRoom = async () => {
    if (!room) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/rooms/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete room");
      }

      // Redirect to dashboard after successful deletion
      router.push("/dashboard");
    } catch (err) {
      console.error("Error deleting room:", err);
      alert("Failed to delete room. Please try again.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Calculate score at current position using cached scoring plays
  const currentScore = useMemo(() => {
    if (!room || scoringPlays.length === 0) {
      return null;
    }

    const sport = room.sport as "nfl" | "mlb" | "nba" | "nhl";
    return getScoreAtPosition(currentPositionEncoded, scoringPlays, sport);
  }, [currentPositionEncoded, scoringPlays, room]);

  // Calculate visible messages count
  const visibleMessagesCount = useMemo(() => {
    if (showSpoilers) return messages.length;

    return messages.filter((msg) => {
      const msgPos =
        msg.position_encoded ??
        (room
          ? encodePosition(
              msg.position as never,
              room.sport as "nfl" | "mlb" | "nba" | "nhl"
            )
          : 0);
      return isPositionVisible(msgPos, currentPositionEncoded);
    }).length;
  }, [messages, currentPositionEncoded, showSpoilers, room]);

  // Calculate hidden messages count (messages beyond current position)
  const hiddenMessagesCount = useMemo(() => {
    if (showSpoilers) return 0; // All messages visible, none hidden

    return messages.filter((msg) => {
      const msgPos =
        msg.position_encoded ??
        (room
          ? encodePosition(
              msg.position as never,
              room.sport as "nfl" | "mlb" | "nba" | "nhl"
            )
          : 0);
      return msgPos > currentPositionEncoded; // Count messages ahead of current position
    }).length;
  }, [messages, currentPositionEncoded, showSpoilers, room]);

  // Get message positions for markers with different categories
  // When spoiler protection is OFF (showSpoilers = true), show all markers with colors
  // When spoiler protection is ON (showSpoilers = false), only show past markers
  const messageMarkers = useMemo(() => {
    if (!room || !userId) return { own: [], others: [] };

    const ownPast: number[] = [];
    const ownFuture: number[] = [];
    const othersPast: number[] = [];
    const othersFuture: number[] = [];

    messages.forEach((msg) => {
      const msgPos =
        msg.position_encoded ??
        encodePosition(
          msg.position as never,
          room.sport as "nfl" | "mlb" | "nba" | "nhl"
        );

      const isOwn = msg.user_id === userId;
      const isPast = msgPos <= currentPositionEncoded;

      if (isOwn) {
        if (isPast || showSpoilers) {
          ownPast.push(msgPos);
        }
        if (!isPast && showSpoilers) {
          ownFuture.push(msgPos);
        }
      } else {
        if (isPast || showSpoilers) {
          othersPast.push(msgPos);
        }
        if (!isPast && showSpoilers) {
          othersFuture.push(msgPos);
        }
      }
    });

    return {
      own: showSpoilers ? [...ownPast, ...ownFuture] : ownPast,
      others: showSpoilers ? [...othersPast, ...othersFuture] : othersPast,
      ownPast,
      ownFuture,
      othersPast,
      othersFuture,
    };
  }, [messages, room, userId, currentPositionEncoded, showSpoilers]);

  // Legacy support - combine all markers for components expecting single array
  const messagePositions = useMemo(() => {
    return [...messageMarkers.own, ...messageMarkers.others];
  }, [messageMarkers]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading watch party...</p>
      </div>
    );
  }

  if (error || !room) {
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
  const sport = room.sport as "nfl" | "mlb" | "nba" | "nhl";
  const isCreator = userId && room.created_by === userId;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              {/* Room Name / Game Info */}
              {isEditing ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Enter party name (optional)"
                    maxLength={100}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-xl font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Save"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Cancel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {room.name || `${gameData?.awayTeam} @ ${gameData?.homeTeam}`}
                  </h1>
                  {isCreator && (
                    <button
                      onClick={handleStartEdit}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit party name"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-gray-600">
                  {room.sport.toUpperCase()} Watch Party
                  {room.name && ` • ${gameData?.awayTeam} @ ${gameData?.homeTeam}`}
                </p>
                {/* Game Status Badge */}
                {gameStatus && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      gameStatus === "STATUS_IN_PROGRESS" || gameStatus === "IN_PROGRESS" || gameStatus === "LIVE"
                        ? "bg-red-100 text-red-700 animate-pulse"
                        : gameStatus === "STATUS_FINAL" || gameStatus === "POST" || gameStatus === "FINAL"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {gameStatus === "STATUS_IN_PROGRESS" || gameStatus === "IN_PROGRESS" || gameStatus === "LIVE" ? (
                      <>
                        <Radio className="w-3 h-3" />
                        LIVE
                      </>
                    ) : gameStatus === "STATUS_FINAL" || gameStatus === "POST" || gameStatus === "FINAL" ? (
                      "FINAL"
                    ) : (
                      "SCHEDULED"
                    )}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                  {memberCount} {memberCount === 1 ? "member" : "members"}
                </span>
              </div>
              <ShareMenu
                shareOptions={{
                  userName,
                  shareCode: room.share_code,
                  roomName: room.name || undefined,
                  gameName: `${gameData?.awayTeam} @ ${gameData?.homeTeam}`,
                  sport: sport,
                }}
              />
            </div>
          </div>

          {/* Message Stats */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              <span>
                {visibleMessagesCount} / {messages.length} messages visible
              </span>
            </div>
          </div>

          {/* Members List */}
          <div className="pt-4 border-t border-gray-200 mb-4">
            <p className="font-medium text-gray-900 mb-2">Party Members</p>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => {
                const isCreator = member.user_id === room.created_by;
                const isCurrentUser = member.user_id === userId;
                const displayName =
                  member.display_name || "Member";

                return (
                  <div
                    key={member.user_id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                      isCurrentUser
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {isCreator && (
                      <Crown className="w-3.5 h-3.5 text-yellow-600" />
                    )}
                    <span className="font-medium">
                      {displayName}
                      {isCurrentUser && " (you)"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extra Spoiler Protection Toggle */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Extra Spoiler Protection</p>
                <p className="text-xs text-gray-600">
                  {showSpoilers
                    ? "Timeline markers visible"
                    : "Hide future comment markers on timeline"}
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
            {/* Hidden messages count */}
            {!showSpoilers && hiddenMessagesCount > 0 && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                <MessageCircle className="w-3 h-3 inline mr-1" />
                {hiddenMessagesCount} {hiddenMessagesCount === 1 ? "comment" : "comments"} ahead (markers hidden)
              </div>
            )}
          </div>

          {/* Delete Room (Creator Only) */}
          {isCreator && (
            <div className="pt-4 border-t border-gray-200 mt-4">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete Watch Party
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Watch Party?</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                This will permanently delete this watch party and all associated messages. All members will lose access.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteRoom}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
                >
                  {isDeleting ? "Deleting..." : "Delete Party"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 disabled:border-gray-200 disabled:text-gray-400 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Position Slider - New Box Score UI */}
        <BoxScorePosition
          sport={sport}
          positionEncoded={currentPositionEncoded}
          onChange={handlePositionChange}
          gameData={gameData}
          messagePositions={messagePositions}
          messageMarkers={messageMarkers}
          livePositionEncoded={livePositionEncoded}
          onGoLive={handleGoLive}
        />

        {/* Message Composer */}
        {userId && (
          <MessageComposerEnhanced
            roomId={id}
            currentPositionEncoded={currentPositionEncoded}
            sport={sport}
          />
        )}

        {/* Messages */}
        {userId && (
          <MessageFeedEnhanced
            messages={messages}
            currentPositionEncoded={currentPositionEncoded}
            sport={sport}
            showSpoilers={showSpoilers}
            currentUserId={userId}
            scoringPlays={scoringPlays}
          />
        )}
      </div>
    </div>
  );
}

// Enhanced MessageComposer that uses encoded positions
function MessageComposerEnhanced({
  roomId,
  currentPositionEncoded,
  sport,
}: {
  roomId: string;
  currentPositionEncoded: number;
  sport: "nfl" | "mlb" | "nba" | "nhl";
}) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: roomId,
          content: content.trim(),
          position_encoded: currentPositionEncoded,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setContent("");
      // Message will appear via Postgres Changes real-time subscription
      // No need to manually refetch - saves position from jumping back!
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Share your reaction..."
          maxLength={500}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || isSending}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
        >
          {isSending ? "..." : "Send"}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Message will be tagged at your current position
      </p>
    </div>
  );
}

// Reaction Pill Component
function ReactionPill({
  emoji,
  users,
  onToggle,
}: {
  emoji: string;
  users: ReactionUser[];
  onToggle: () => void;
}) {
  if (users.length === 0) return null;

  const hasUserReacted = users.some((u) => u.is_current_user);

  // Generate display text
  const getDisplayText = () => {
    if (users.length === 1) {
      return users[0].is_current_user ? "You" : users[0].display_name;
    }

    if (users.length === 2) {
      const names = users.map((u) =>
        u.is_current_user ? "You" : u.display_name
      );
      return names.join(", ");
    }

    // 3+ reactions
    const [first, second, ...rest] = users;
    const firstName = first.is_current_user ? "You" : first.display_name;
    const secondName = second.is_current_user ? "You" : second.display_name;

    if (users.length === 3) {
      const thirdName = rest[0].is_current_user
        ? "You"
        : rest[0].display_name;
      return `${firstName}, ${secondName}, ${thirdName}`;
    }

    return `${firstName}, ${secondName}, +${rest.length} others`;
  };

  const displayText = getDisplayText();
  const tooltipText = users
    .map((u) => (u.is_current_user ? "You" : u.display_name))
    .join(", ");

  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors ${
        hasUserReacted
          ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
          : "bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300"
      }`}
      title={tooltipText}
    >
      <span>{emoji}</span>
      <span className="font-medium">{displayText}</span>
    </button>
  );
}

// Enhanced MessageFeed that uses encoded positions for filtering
function MessageFeedEnhanced({
  messages,
  currentPositionEncoded,
  sport,
  showSpoilers,
  currentUserId,
  scoringPlays,
}: {
  messages: ExtendedMessage[];
  currentPositionEncoded: number;
  sport: "nfl" | "mlb" | "nba" | "nhl";
  showSpoilers: boolean;
  currentUserId: string;
  scoringPlays: ScoringPlay[];
}) {
  const toggleReaction = async (
    messageId: string,
    reactionType: string
  ) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction_type: reactionType }),
      });

      if (!response.ok) {
        console.error("Failed to toggle reaction");
      }
      // Realtime will handle the update
    } catch (err) {
      console.error("Error toggling reaction:", err);
    }
  };
  // Messages are ALWAYS filtered to only show at or before current position
  // Spoiler setting only affects timeline markers, not message visibility
  const visibleMessages = useMemo(() => {
    return messages.filter((msg) => {
      const msgPos =
        msg.position_encoded ?? encodePosition(msg.position as never, sport);
      return isPositionVisible(msgPos, currentPositionEncoded);
    });
  }, [messages, currentPositionEncoded, sport]);

  if (messages.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No messages yet</p>
        <p className="text-sm text-gray-500">Be the first to share a reaction!</p>
      </div>
    );
  }

  if (visibleMessages.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No messages at your current position</p>
        <p className="text-sm text-gray-500">
          Advance your position or toggle spoiler protection to see messages
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">
          Messages ({visibleMessages.length})
        </h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {visibleMessages.map((msg) => {
          const msgPos =
            msg.position_encoded ?? encodePosition(msg.position as never, sport);
          const formattedPos = formatGamePosition(
            msg.position as never,
            sport
          );
          const isOwnMessage = msg.user_id === currentUserId;

          // Calculate score at this message's position
          const scoreAtPosition = scoringPlays.length > 0
            ? getScoreAtPosition(msgPos, scoringPlays, sport)
            : null;

          // Format timestamp in Eastern Time
          const messageTime = new Date(msg.created_at).toLocaleString("en-US", {
            timeZone: "America/New_York",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          const reactions = msg.reactions || {
            thumbs_up: [],
            thumbs_down: [],
            question: [],
            exclamation: [],
          };

          return (
            <div
              key={msg.id}
              className={`group p-4 border-l-4 ${
                isOwnMessage
                  ? "bg-blue-50 border-blue-500"
                  : "bg-white border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        isOwnMessage ? "text-blue-700" : "text-gray-700"
                      }`}
                    >
                      {isOwnMessage
                        ? "You"
                        : msg.sender_display_name || "Member"}
                    </span>
                    {scoreAtPosition && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded font-mono text-gray-600">
                        {scoreAtPosition.away}-{scoreAtPosition.home}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {messageTime} ET
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {formattedPos}
                </span>
              </div>
              <p className="text-gray-900 text-sm leading-relaxed mb-2">
                {msg.content}
              </p>

              {/* Reactions */}
              <div className="flex flex-wrap gap-2 items-center mt-2">
                {/* Existing reactions */}
                {reactions.thumbs_up.length > 0 && (
                  <ReactionPill
                    emoji="👍"
                    users={reactions.thumbs_up}
                    onToggle={() => toggleReaction(msg.id, "thumbs_up")}
                  />
                )}
                {reactions.thumbs_down.length > 0 && (
                  <ReactionPill
                    emoji="👎"
                    users={reactions.thumbs_down}
                    onToggle={() => toggleReaction(msg.id, "thumbs_down")}
                  />
                )}
                {reactions.question.length > 0 && (
                  <ReactionPill
                    emoji="❓"
                    users={reactions.question}
                    onToggle={() => toggleReaction(msg.id, "question")}
                  />
                )}
                {reactions.exclamation.length > 0 && (
                  <ReactionPill
                    emoji="❗"
                    users={reactions.exclamation}
                    onToggle={() => toggleReaction(msg.id, "exclamation")}
                  />
                )}

                {/* Always visible add reaction buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleReaction(msg.id, "thumbs_up")}
                    className="p-1.5 text-lg hover:bg-gray-200 rounded transition-colors opacity-60 hover:opacity-100"
                    title="Thumbs up"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => toggleReaction(msg.id, "thumbs_down")}
                    className="p-1.5 text-lg hover:bg-gray-200 rounded transition-colors opacity-60 hover:opacity-100"
                    title="Thumbs down"
                  >
                    👎
                  </button>
                  <button
                    onClick={() => toggleReaction(msg.id, "question")}
                    className="p-1.5 text-lg hover:bg-gray-200 rounded transition-colors opacity-60 hover:opacity-100"
                    title="Question"
                  >
                    ❓
                  </button>
                  <button
                    onClick={() => toggleReaction(msg.id, "exclamation")}
                    className="p-1.5 text-lg hover:bg-gray-200 rounded transition-colors opacity-60 hover:opacity-100"
                    title="Exclamation"
                  >
                    ❗
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
