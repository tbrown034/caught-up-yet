"use client";

import { use, useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  EyeIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
  TrashIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import type {
  Room,
  Message,
  GameData,
  RoomMember,
  GameStatus,
} from "@/lib/database.types";
import { encodePosition, isPositionVisible } from "@/lib/position-encoding";
import { formatGamePosition } from "@/lib/game-position";
import { createClient } from "@/lib/supabase/client";
import { formatShareCode } from "@/lib/share-code";
import { debounce } from "@/lib/utils";
import { calculateLivePosition } from "@/lib/live-position";
import type { ScoringPlay } from "@/lib/score-at-position";
import {
  getScoreAtPosition,
  isGameLive as checkIfGameLive,
} from "@/lib/score-at-position";
import { fetchGameScoringPlays, fetchGameStatus } from "@/lib/espn-api";

// New chat-first components
import GameInfoPanel from "@/components/rooms/GameInfoPanel";
import RoomDrawer from "@/components/rooms/RoomDrawer";
import CompactTimeline from "@/components/rooms/CompactTimeline";
import ShareMenu from "@/components/rooms/ShareMenu";
import WelcomeModal from "@/components/rooms/WelcomeModal";
import type { MessageMarkers } from "@/components/rooms/BoxScorePosition";

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
  sender_display_name?: string | null;
  reactions?: MessageReactions;
}

export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State
  const [room, setRoom] = useState<Room | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [currentPositionEncoded, setCurrentPositionEncoded] = useState<number>(0);
  const [showSpoilers, setShowSpoilers] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Someone");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [livePositionEncoded, setLivePositionEncoded] = useState<number | null>(
    null
  );
  const [scoringPlays, setScoringPlays] = useState<ScoringPlay[]>([]);
  const [gameStatus, setGameStatus] = useState<string | null>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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
        if (response.status === 404) {
          setError("This watch party doesn't exist or has been deleted");
          setIsLoading(false);
          return;
        }
        if (response.status === 410) {
          setError(
            "This watch party has expired. Watch parties expire after the game ends."
          );
          setIsLoading(false);
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

      // Handle position
      if (data.current_user_position_encoded !== undefined) {
        setCurrentPositionEncoded(data.current_user_position_encoded);
      } else if (data.current_user_position && data.room) {
        const encoded = encodePosition(
          data.current_user_position,
          data.room.sport as "nfl" | "mlb" | "nba" | "nhl"
        );
        setCurrentPositionEncoded(encoded);
      }

      // Calculate live position
      if (data.room?.game_data?.status) {
        const gameStatusObj =
          typeof data.room.game_data.status === "string"
            ? { type: data.room.game_data.status }
            : (data.room.game_data.status as GameStatus);

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

  // Get current user
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

  // Check for welcome param
  useEffect(() => {
    if (searchParams.get("welcome") === "true") {
      setShowWelcome(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("welcome");
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, router]);

  // Fetch scoring plays
  useEffect(() => {
    if (!room) return;

    const fetchPlays = async () => {
      try {
        const sport = room.sport as "nfl" | "mlb" | "nba" | "nhl";
        const plays = await fetchGameScoringPlays(room.game_id, sport);
        setScoringPlays(plays);
      } catch (error) {
        console.error("Error fetching scoring plays:", error);
      }
    };

    fetchPlays();

    const gameData = room.game_data as GameData;
    if (gameData?.status) {
      const statusType =
        typeof gameData.status === "string"
          ? gameData.status
          : gameData.status.type;

      if (checkIfGameLive(statusType)) {
        const interval = setInterval(fetchPlays, 60000);
        return () => clearInterval(interval);
      }
    }
  }, [room]);

  // Fetch live game status
  useEffect(() => {
    if (!room) return;

    const updateLiveStatus = async () => {
      try {
        const sport = room.sport as "nfl" | "mlb" | "nba" | "nhl";
        const freshStatus = await fetchGameStatus(room.game_id, sport);

        if (freshStatus) {
          setGameStatus(freshStatus.type);

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

    updateLiveStatus();
    const interval = setInterval(updateLiveStatus, 30000);
    return () => clearInterval(interval);
  }, [room]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel(`room-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${id}`,
        },
        (payload) => {
          const newMessage = payload.new as ExtendedMessage;

          setMembers((currentMembers) => {
            const sender = currentMembers.find(
              (m) => m.user_id === newMessage.user_id
            );
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

            setMessages((prev) => {
              const exists = prev.some((msg) => msg.id === enrichedMessage.id);
              if (exists) return prev;
              return [...prev, enrichedMessage];
            });
            return currentMembers;
          });

          // Auto-scroll on new message
          setTimeout(scrollToBottom, 100);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setRoom(payload.new as Room);

          const newRoom = payload.new as Room;
          if (newRoom.game_data) {
            const gameData = newRoom.game_data as GameData;
            if (gameData.status) {
              const status =
                typeof gameData.status === "string"
                  ? { type: gameData.status }
                  : (gameData.status as GameStatus);

              const livePos = calculateLivePosition(
                status,
                newRoom.sport as "nfl" | "mlb" | "nba" | "nhl"
              );
              setLivePositionEncoded(livePos);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_members",
          filter: `room_id=eq.${id}`,
        },
        () => {
          fetchRoomData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
        },
        () => {
          fetchRoomData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, supabase, fetchRoomData, scrollToBottom]);

  // Debounced position save
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
    }, 30000)
  ).current;

  // Position change handler
  const handlePositionChange = useCallback(
    (newPositionEncoded: number) => {
      setCurrentPositionEncoded(newPositionEncoded);
      savePositionToDB(id, newPositionEncoded);
    },
    [id, savePositionToDB]
  );

  // Go to live position
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
      setShowSpoilers(!newValue);
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

      router.push("/dashboard");
    } catch (err) {
      console.error("Error deleting room:", err);
      alert("Failed to delete room. Please try again.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Calculate score at current position for header display
  const currentScore = useMemo(() => {
    if (!room || scoringPlays.length === 0) {
      return null;
    }
    const sport = room.sport as "nfl" | "mlb" | "nba" | "nhl";
    return getScoreAtPosition(currentPositionEncoded, scoringPlays, sport);
  }, [currentPositionEncoded, scoringPlays, room]);

  // Visible/hidden message counts
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

  const hiddenMessagesCount = useMemo(() => {
    if (showSpoilers) return 0;

    return messages.filter((msg) => {
      const msgPos =
        msg.position_encoded ??
        (room
          ? encodePosition(
              msg.position as never,
              room.sport as "nfl" | "mlb" | "nba" | "nhl"
            )
          : 0);
      return msgPos > currentPositionEncoded;
    }).length;
  }, [messages, currentPositionEncoded, showSpoilers, room]);

  // Message markers for timeline
  const messageMarkers = useMemo(() => {
    if (!room || !userId) {
      return {
        own: [],
        others: [],
        ownPast: [],
        ownFuture: [],
        othersPast: [],
        othersFuture: [],
      };
    }

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
        if (isPast || showSpoilers) ownPast.push(msgPos);
        if (!isPast && showSpoilers) ownFuture.push(msgPos);
      } else {
        if (isPast || showSpoilers) othersPast.push(msgPos);
        if (!isPast && showSpoilers) othersFuture.push(msgPos);
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

  const messagePositions = useMemo(() => {
    return [...messageMarkers.own, ...messageMarkers.others];
  }, [messageMarkers]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-600 dark:text-gray-400">
          Loading watch party...
        </p>
      </div>
    );
  }

  // Error state
  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 max-w-md w-full text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-4">
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
  const isLive =
    gameStatus === "STATUS_IN_PROGRESS" ||
    gameStatus === "IN_PROGRESS" ||
    gameStatus === "LIVE";

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-950" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* Game Info Panel */}
      <GameInfoPanel
        sport={sport}
        positionEncoded={currentPositionEncoded}
        gameStatus={gameStatus}
        showSpoilers={showSpoilers}
        onMenuClick={() => setShowDrawer(true)}
        gameData={gameData}
        currentScore={currentScore}
      />

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        shareCode={room.share_code}
        roomName={room.name}
        gameName={`${gameData?.awayTeam} @ ${gameData?.homeTeam}`}
        sport={sport}
        userName={userName}
      />

      {/* Message List - Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {userId && (
            <ChatMessageList
            messages={messages}
            currentPositionEncoded={currentPositionEncoded}
            sport={sport}
            showSpoilers={showSpoilers}
            currentUserId={userId}
            currentUserDisplayName={userName}
            scoringPlays={scoringPlays}
            hiddenMessagesCount={hiddenMessagesCount}
            roomCreatedAt={room.created_at}
            creatorName={members.find(m => m.user_id === room.created_by)?.display_name || userName}
            creatorId={room.created_by}
            members={members}
            onReactionToggled={(messageId, reactionType, action) => {
              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id !== messageId) return msg;

                  const reactions = msg.reactions
                    ? { ...msg.reactions }
                    : {
                        thumbs_up: [],
                        thumbs_down: [],
                        question: [],
                        exclamation: [],
                      };

                  const reactionArray =
                    reactions[reactionType as keyof MessageReactions] || [];

                  if (action === "added") {
                    if (!reactionArray.some((u) => u.is_current_user)) {
                      reactions[reactionType as keyof MessageReactions] = [
                        ...reactionArray,
                        {
                          user_id: userId,
                          display_name: userName,
                          is_current_user: true,
                        },
                      ];
                    }
                  } else {
                    reactions[reactionType as keyof MessageReactions] =
                      reactionArray.filter((u) => !u.is_current_user);
                  }

                  return { ...msg, reactions };
                })
              );
            }}
          />
        )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Compact Timeline + Composer Container */}
      <div className="max-w-3xl mx-auto w-full mb-4">
        {/* Compact Timeline */}
      <CompactTimeline
        sport={sport}
        positionEncoded={currentPositionEncoded}
        onChange={handlePositionChange}
        livePositionEncoded={livePositionEncoded}
        onGoLive={handleGoLive}
        isLive={isLive}
        messagePositions={messagePositions}
      />

      {/* Message Composer */}
      {userId && (
        <ChatComposer
          roomId={id}
          currentPositionEncoded={currentPositionEncoded}
          sport={sport}
          onMessageSent={(message) => {
            setMessages((prev) => {
              const exists = prev.some((msg) => msg.id === message.id);
              if (exists) return prev;
              return [...prev, message];
            });
            setTimeout(scrollToBottom, 100);
          }}
        />
      )}
      </div>

      {/* Room Drawer */}
      <RoomDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        roomName={room.name}
        shareCode={room.share_code}
        sport={sport}
        gameData={gameData}
        creatorId={room.created_by}
        userId={userId || ""}
        userName={userName}
        members={members}
        positionEncoded={currentPositionEncoded}
        onPositionChange={handlePositionChange}
        livePositionEncoded={livePositionEncoded}
        onGoLive={handleGoLive}
        messagePositions={messagePositions}
        messageMarkers={messageMarkers}
        showSpoilers={showSpoilers}
        onToggleSpoilers={handleToggleSpoilers}
        hiddenMessagesCount={hiddenMessagesCount}
        gameStatus={gameStatus}
        onDeleteRoom={() => setShowDeleteConfirm(true)}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Delete Watch Party?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              This will permanently delete this watch party and all associated
              messages.
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
                className="flex-1 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-semibold py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// System message component
function SystemMessage({ text, time }: { text: string; time?: string }) {
  return (
    <div className="flex justify-center py-2">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-500 dark:text-gray-400">
        <span>{text}</span>
        {time && <span className="opacity-60">{time}</span>}
      </div>
    </div>
  );
}

// Apple-style member avatar component
function MemberAvatar({ name, isCreator }: { name: string; isCreator?: boolean }) {
  // Generate initials from name
  const initials = name
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  // Generate consistent color based on name
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-rose-500",
  ];
  const colorIndex = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const bgColor = colors[colorIndex];

  // Get display name (before @ if email)
  const displayName = name.split("@")[0];

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`relative w-14 h-14 ${bgColor} rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md`}>
        {initials || "?"}
        {isCreator && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
            <span className="text-xs">⭐</span>
          </div>
        )}
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
        {displayName}
      </span>
    </div>
  );
}

// Members display component
function MembersDisplay({ members, creatorId }: { members: RoomMember[]; creatorId: string }) {
  if (!members || members.length === 0) return null;

  return (
    <div className="py-4">
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3 uppercase tracking-wider font-medium">
        Watching Together
      </p>
      <div className="flex justify-center gap-4 flex-wrap">
        {members.map((member) => (
          <MemberAvatar
            key={member.user_id}
            name={member.display_name || "Guest"}
            isCreator={member.user_id === creatorId}
          />
        ))}
      </div>
    </div>
  );
}

// Chat-style Message List Component
function ChatMessageList({
  messages,
  currentPositionEncoded,
  sport,
  showSpoilers,
  currentUserId,
  currentUserDisplayName,
  scoringPlays,
  hiddenMessagesCount,
  onReactionToggled,
  roomCreatedAt,
  creatorName,
  creatorId,
  members,
}: {
  messages: ExtendedMessage[];
  currentPositionEncoded: number;
  sport: "nfl" | "mlb" | "nba" | "nhl";
  showSpoilers: boolean;
  currentUserId: string;
  currentUserDisplayName: string;
  scoringPlays: ScoringPlay[];
  hiddenMessagesCount: number;
  onReactionToggled: (
    messageId: string,
    reactionType: string,
    action: "added" | "removed"
  ) => void;
  roomCreatedAt?: string;
  creatorName?: string;
  creatorId?: string;
  members?: RoomMember[];
}) {
  const toggleReaction = async (messageId: string, reactionType: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction_type: reactionType }),
      });

      if (!response.ok) return;

      const data = await response.json();
      onReactionToggled(messageId, reactionType, data.action);
    } catch (err) {
      console.error("Error toggling reaction:", err);
    }
  };

  // Filter visible messages
  const visibleMessages = useMemo(() => {
    return messages.filter((msg) => {
      const msgPos =
        msg.position_encoded ?? encodePosition(msg.position as never, sport);
      return isPositionVisible(msgPos, currentPositionEncoded);
    });
  }, [messages, currentPositionEncoded, sport]);

  // Format room created time
  const roomCreatedTime = roomCreatedAt
    ? new Date(roomCreatedAt).toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  // Build system events (room created, members joined)
  const systemEvents = useMemo(() => {
    const events: { id: string; text: string; time: string; timestamp: number }[] = [];

    // Room created event
    if (roomCreatedAt) {
      const createdDate = new Date(roomCreatedAt);
      events.push({
        id: "room-created",
        text: `${creatorName || "Someone"} started the watch party`,
        time: createdDate.toLocaleString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        timestamp: createdDate.getTime(),
      });
    }

    // Member joined events (excluding creator)
    if (members) {
      members.forEach((member) => {
        if (member.display_name !== creatorName) {
          const joinedDate = new Date(member.joined_at);
          events.push({
            id: `joined-${member.user_id}`,
            text: `${member.display_name || "Someone"} joined`,
            time: joinedDate.toLocaleString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
            timestamp: joinedDate.getTime(),
          });
        }
      });
    }

    return events.sort((a, b) => a.timestamp - b.timestamp);
  }, [roomCreatedAt, creatorName, members]);

  return (
    <div className="p-4 space-y-3">
      {/* System events (room created, members joined) */}
      {systemEvents.map((event) => (
        <SystemMessage key={event.id} text={event.text} time={event.time} />
      ))}

      {/* Members display - Apple style avatars */}
      {members && members.length > 0 && creatorId && (
        <MembersDisplay members={members} creatorId={creatorId} />
      )}

      {/* Empty state - compact */}
      {visibleMessages.length === 0 && (
        <div className="py-8 text-center">
          <ChatBubbleLeftIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {messages.length === 0
              ? "Share your first reaction!"
              : "No messages at your position yet"}
          </p>
        </div>
      )}
      {visibleMessages.map((msg) => {
        const isOwnMessage = msg.user_id === currentUserId;
        const msgPos =
          msg.position_encoded ?? encodePosition(msg.position as never, sport);
        const formattedPos = formatGamePosition(msg.position as never, sport);

        // Score at position
        const scoreAtPosition =
          scoringPlays.length > 0
            ? getScoreAtPosition(msgPos, scoringPlays, sport)
            : null;

        // Time
        const messageTime = new Date(msg.created_at).toLocaleString("en-US", {
          timeZone: "America/New_York",
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
            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] ${
                isOwnMessage ? "order-1" : "order-2"
              }`}
            >
              {/* Sender name for other users */}
              {!isOwnMessage && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-3">
                  {msg.sender_display_name || "Member"}
                </p>
              )}

              {/* Message bubble */}
              <div
                className={`rounded-2xl px-4 py-2 ${
                  isOwnMessage
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-700"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>

              {/* Meta info */}
              <div
                className={`flex items-center gap-2 mt-1 px-1 text-xs text-gray-500 dark:text-gray-400 ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <span>{messageTime}</span>
                <span className="opacity-50">|</span>
                <span>{formattedPos}</span>
                {scoreAtPosition && (
                  <>
                    <span className="opacity-50">|</span>
                    <span className="font-mono">
                      {scoreAtPosition.awayScore}-{scoreAtPosition.homeScore}
                    </span>
                  </>
                )}
              </div>

              {/* Reactions */}
              <div
                className={`flex flex-wrap gap-1 mt-1 ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                {reactions.thumbs_up.length > 0 && (
                  <ReactionBubble
                    emoji="👍"
                    count={reactions.thumbs_up.length}
                    isActive={reactions.thumbs_up.some((u) => u.is_current_user)}
                    onClick={() => toggleReaction(msg.id, "thumbs_up")}
                  />
                )}
                {reactions.thumbs_down.length > 0 && (
                  <ReactionBubble
                    emoji="👎"
                    count={reactions.thumbs_down.length}
                    isActive={reactions.thumbs_down.some(
                      (u) => u.is_current_user
                    )}
                    onClick={() => toggleReaction(msg.id, "thumbs_down")}
                  />
                )}
                {reactions.question.length > 0 && (
                  <ReactionBubble
                    emoji="❓"
                    count={reactions.question.length}
                    isActive={reactions.question.some((u) => u.is_current_user)}
                    onClick={() => toggleReaction(msg.id, "question")}
                  />
                )}
                {reactions.exclamation.length > 0 && (
                  <ReactionBubble
                    emoji="❗"
                    count={reactions.exclamation.length}
                    isActive={reactions.exclamation.some(
                      (u) => u.is_current_user
                    )}
                    onClick={() => toggleReaction(msg.id, "exclamation")}
                  />
                )}

                {/* Quick reaction buttons */}
                <div className="flex gap-0.5 ml-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleReaction(msg.id, "thumbs_up")}
                    className="p-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    👍
                  </button>
                  <button
                    onClick={() => toggleReaction(msg.id, "thumbs_down")}
                    className="p-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    👎
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Hidden messages indicator */}
      {hiddenMessagesCount > 0 && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400">
            <LockClosedIcon className="w-4 h-4" />
            <span>
              {hiddenMessagesCount}{" "}
              {hiddenMessagesCount === 1 ? "message" : "messages"} ahead
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Reaction bubble component
function ReactionBubble({
  emoji,
  count,
  isActive,
  onClick,
}: {
  emoji: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
        isActive
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
      }`}
    >
      <span>{emoji}</span>
      <span className="font-medium">{count}</span>
    </button>
  );
}

// Chat-style Message Composer
function ChatComposer({
  roomId,
  currentPositionEncoded,
  sport,
  onMessageSent,
}: {
  roomId: string;
  currentPositionEncoded: number;
  sport: "nfl" | "mlb" | "nba" | "nhl";
  onMessageSent: (message: ExtendedMessage) => void;
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

      const data = await response.json();

      const newMessage: ExtendedMessage = {
        ...data.message,
        sender_display_name: "You",
        reactions: {
          thumbs_up: [],
          thumbs_down: [],
          question: [],
          exclamation: [],
        },
      };
      onMessageSent(newMessage);

      setContent("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 pb-6">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Share your reaction..."
          maxLength={500}
          className="flex-1 px-5 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base"
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || isSending}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors"
        >
          {isSending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
