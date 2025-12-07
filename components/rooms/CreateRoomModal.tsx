"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { XMarkIcon, ArrowRightEndOnRectangleIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import type { ESPNGame } from "@/lib/espn-api";
import { fetchGameScoringPlays } from "@/lib/espn-api";
import { formatShareCode } from "@/lib/share-code";
import { createClient } from "@/lib/supabase/client";
import ShareMenu from "@/components/rooms/ShareMenu";
import Button from "@/components/ui/Button";

interface CreateRoomModalProps {
  game: ESPNGame;
  onClose: () => void;
}

export default function CreateRoomModal({
  game,
  onClose,
}: CreateRoomModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("Someone");

  const awayTeam = game.competitors[0];
  const homeTeam = game.competitors[1];

  // Get user name
  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        setUserName(user.email.split("@")[0]);
      }
    }
    fetchUser();
  }, [supabase.auth]);

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);

    try {
      // Fetch scoring plays for real-time score calculation
      const scoringPlays = await fetchGameScoringPlays(game.id, game.sport);

      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: game.id,
          sport: game.sport,
          name: roomName.trim() || null,
          game_data: {
            homeTeam: homeTeam.team.displayName,
            awayTeam: awayTeam.team.displayName,
            homeScore: homeTeam.score,
            awayScore: awayTeam.score,
            status: game.status.type,
            gameDate: game.date,
            // Include quarter/period/inning scores for spoiler-safe display
            homeLinescores: homeTeam.linescores || [],
            awayLinescores: awayTeam.linescores || [],
            // Include scoring plays for real-time score calculation
            scoringPlays,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        // Handle auth-specific errors with a friendly UI
        if (response.status === 401 || response.status === 403) {
          setAuthRequired(true);
          setIsCreating(false);
          return;
        }
        throw new Error(data.error || "Failed to create room");
      }

      const data = await response.json();
      setShareCode(data.share_code);
      setRoomId(data.room.id);
    } catch (err) {
      console.error("Error creating room:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create watch party"
      );
      setIsCreating(false);
    }
  };

  const handleJoinRoom = () => {
    if (roomId) {
      router.push(`/rooms/${roomId}`);
    }
  };

  // Show auth required state
  if (authRequired) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowRightEndOnRectangleIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sign In Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You need to sign in to create watch parties. It only takes a moment!
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                With an account you can:
              </p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  Create unlimited watch parties
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  Invite friends with share codes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  Track your watch party history
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                href="/login?redirect=/games"
                asLink
                className="w-full justify-center"
              >
                <ArrowRightEndOnRectangleIcon className="w-5 h-5" />
                Sign In / Sign Up
              </Button>
              <button
                onClick={onClose}
                className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg transition-colors"
              >
                Maybe Later
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Already have a share code?{" "}
                <button
                  onClick={() => router.push("/rooms/join")}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Join as guest
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success state with share code
  if (shareCode && roomId) {
    const gameName = `${awayTeam.team.displayName} @ ${homeTeam.team.displayName}`;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Watch Party Created!
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Invite your friends and family to join
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-xs text-gray-600 mb-2">Share Code</p>
              <p className="text-3xl font-bold text-blue-600 tracking-wider">
                {formatShareCode(shareCode)}
              </p>
            </div>

            {/* Share Menu */}
            <div className="mb-4 flex justify-center">
              <ShareMenu
                shareOptions={{
                  userName,
                  shareCode,
                  roomName: roomName || undefined,
                  gameName,
                  sport: game.sport,
                }}
                variant="success"
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleJoinRoom}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Enter Watch Party
              </button>
              <button
                onClick={onClose}
                className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
              >
                Stay on Games Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show create form
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Create Watch Party
        </h2>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">Game</p>
          <p className="font-semibold text-gray-900">
            {awayTeam.team.displayName} @ {homeTeam.team.displayName}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(game.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="mb-6">
          <label
            htmlFor="roomName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Party Name (optional)
          </label>
          <input
            id="roomName"
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="e.g., Sunday Night Crew"
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Give your watch party a custom name (you can change this later)
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>How it works:</strong> Create a private watch party for
            this game. You'll get a share code to invite friends and family.
            Everyone can chat while watching at their own pace—spoiler
            protection included!
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isCreating ? "Creating..." : "Create Watch Party"}
          </button>
          <button
            onClick={onClose}
            disabled={isCreating}
            className="w-full border-2 border-gray-300 hover:border-gray-400 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 font-semibold py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
