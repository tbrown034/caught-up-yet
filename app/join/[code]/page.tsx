"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  UserGroupIcon,
  PlayIcon,
  ClockIcon,
  TvIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import BrandIcon from "@/components/ui/BrandIcon";

interface RoomPreview {
  id: string;
  name: string | null;
  sport: string;
  game_data: {
    home_team: string;
    away_team: string;
    home_abbrev?: string;
    away_abbrev?: string;
    status?: string;
    start_time?: string;
  };
  member_count: number;
  is_active: boolean;
  expires_at: string;
}

type WatchingStatus = "live" | "delayed" | "not-yet" | null;

export default function JoinByCodePage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string)?.toUpperCase();
  const supabase = createClient();

  const [roomPreview, setRoomPreview] = useState<RoomPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [guestName, setGuestName] = useState("");
  const [watchingStatus, setWatchingStatus] = useState<WatchingStatus>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Check auth and fetch room preview
  useEffect(() => {
    async function init() {
      // Check auth
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user && !user.is_anonymous);

      // Fetch room preview by share code
      try {
        const response = await fetch(`/api/rooms/preview?code=${code}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Room not found");
        }
        const data = await response.json();
        setRoomPreview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load room");
      } finally {
        setIsLoading(false);
      }
    }

    if (code) {
      init();
    }
  }, [code, supabase.auth]);

  const handleJoin = async () => {
    if (!watchingStatus) {
      setError("Please select when you're watching");
      return;
    }

    if (!isAuthenticated && !guestName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      // Sign in anonymously if needed
      if (!isAuthenticated) {
        const { error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) throw new Error("Unable to join. Please check your internet connection and try again.");
      }

      // Join the room
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          share_code: code,
          display_name: !isAuthenticated ? guestName.trim() : undefined,
          watching_status: watchingStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to join room");
      }

      const data = await response.json();
      router.push(`/rooms/${data.room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 rounded-full animate-spin" />
          <span>Loading party details...</span>
        </div>
      </div>
    );
  }

  if (error && !roomPreview) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <UserGroupIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Party Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button variant="primary" href="/games" asLink>
            Browse Games
          </Button>
        </div>
      </div>
    );
  }

  const gameTitle = roomPreview
    ? `${roomPreview.game_data.away_team} @ ${roomPreview.game_data.home_team}`
    : "";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <BrandIcon size={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            You're Invited!
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Join this spoiler-free watch party
          </p>
        </div>

        {/* Game Card */}
        {roomPreview && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded font-medium">
                {roomPreview.sport.toUpperCase()}
              </span>
              {roomPreview.game_data.status && (
                <span>{roomPreview.game_data.status}</span>
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {gameTitle}
            </h2>
            {roomPreview.name && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Party: {roomPreview.name}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <UserGroupIcon className="w-4 h-4" />
                {roomPreview.member_count} watching
              </span>
            </div>
          </div>
        )}

        {/* Watching Status Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            When are you watching?
          </label>
          <div className="space-y-2">
            <button
              onClick={() => setWatchingStatus("live")}
              className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                watchingStatus === "live"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <PlayIcon
                className={`w-5 h-5 ${
                  watchingStatus === "live"
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              />
              <div className="text-left">
                <p
                  className={`font-medium ${
                    watchingStatus === "live"
                      ? "text-blue-600"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  Watching Live
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  I'm watching in real-time
                </p>
              </div>
            </button>

            <button
              onClick={() => setWatchingStatus("delayed")}
              className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                watchingStatus === "delayed"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <ClockIcon
                className={`w-5 h-5 ${
                  watchingStatus === "delayed"
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              />
              <div className="text-left">
                <p
                  className={`font-medium ${
                    watchingStatus === "delayed"
                      ? "text-blue-600"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  On Delay / DVR
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  I'm behind - protect me from spoilers
                </p>
              </div>
            </button>

            <button
              onClick={() => setWatchingStatus("not-yet")}
              className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                watchingStatus === "not-yet"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <TvIcon
                className={`w-5 h-5 ${
                  watchingStatus === "not-yet"
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              />
              <div className="text-left">
                <p
                  className={`font-medium ${
                    watchingStatus === "not-yet"
                      ? "text-blue-600"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  Haven't Started Yet
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  I'll update my position when I start
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Guest Name Input */}
        {isAuthenticated === false && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Name
            </label>
            <div className="relative">
              <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name"
                maxLength={30}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Join Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={handleJoin}
          disabled={isJoining || !watchingStatus}
          className="w-full justify-center"
        >
          {isJoining ? "Joining..." : "Join Watch Party"}
        </Button>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Share code: <span className="font-mono font-bold">{code}</span>
        </p>
      </div>
    </div>
  );
}
