"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XMarkIcon, ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";
import type { ESPNGame } from "@/lib/espn-api";
import { fetchGameScoringPlays } from "@/lib/espn-api";
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
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

  const awayTeam = game.competitors[0];
  const homeTeam = game.competitors[1];

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
          name: null,
          game_data: {
            homeTeam: homeTeam.team.displayName,
            awayTeam: awayTeam.team.displayName,
            homeScore: homeTeam.score,
            awayScore: awayTeam.score,
            status: game.status.type,
            gameDate: game.date,
            homeLinescores: homeTeam.linescores || [],
            awayLinescores: awayTeam.linescores || [],
            scoringPlays,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401 || response.status === 403) {
          setAuthRequired(true);
          setIsCreating(false);
          return;
        }
        throw new Error(data.error || "Failed to create room");
      }

      const data = await response.json();
      // Go directly to the room with welcome flag to show share code there
      router.push(`/rooms/${data.room.id}?welcome=true`);
    } catch (err) {
      console.error("Error creating room:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create watch party"
      );
      setIsCreating(false);
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
              Sign in to create watch parties and invite friends.
            </p>

            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                href={`/login?redirect=${encodeURIComponent(`/games?createParty=${game.id}`)}`}
                asLink
                className="w-full justify-center"
              >
                Sign In / Sign Up
              </Button>
              <button
                onClick={onClose}
                className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Have a share code?{" "}
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

  // Show simple create confirmation
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-sm w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Create Watch Party
        </h2>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <p className="font-semibold text-gray-900 dark:text-white">
            {awayTeam.team.displayName} @ {homeTeam.team.displayName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {new Date(game.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isCreating ? "Creating..." : "Create & Enter Party"}
          </button>
          <button
            onClick={onClose}
            disabled={isCreating}
            className="w-full text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
