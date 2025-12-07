"use client";

import { useState } from "react";
import Image from "next/image";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import type { ESPNGame } from "@/lib/espn-api";

interface HomeGameCardProps {
  game: ESPNGame;
}

export default function HomeGameCard({ game }: HomeGameCardProps) {
  const [revealedScores, setRevealedScores] = useState<{
    away: boolean;
    home: boolean;
  }>({
    away: false,
    home: false,
  });

  const isLive = game.status.type === "STATUS_IN_PROGRESS";
  const isFinal = game.status.type === "STATUS_FINAL";
  const shouldHideScore = isLive || isFinal;

  const handleToggleScore = (team: "away" | "home") => {
    setRevealedScores((prev) => ({ ...prev, [team]: !prev[team] }));
  };

  const ScoreDisplay = ({
    score,
    team,
  }: {
    score: string | undefined;
    team: "away" | "home";
  }) => {
    if (!score) return null;

    const isRevealed = revealedScores[team];

    if (!shouldHideScore) {
      return (
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {score}
        </span>
      );
    }

    if (isRevealed) {
      return (
        <button
          onClick={() => handleToggleScore(team)}
          className="group flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded transition-colors"
          title="Click to hide"
        >
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {score}
          </span>
          <EyeSlashIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        </button>
      );
    }

    return (
      <button
        onClick={() => handleToggleScore(team)}
        className="group flex items-center gap-1.5 px-2 py-1 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 rounded transition-colors"
        title="Click to reveal"
      >
        <div className="flex gap-0.5">
          <div className="w-1 h-4 bg-gray-700 dark:bg-gray-500 group-hover:bg-gray-600 dark:group-hover:bg-gray-400 rounded-sm" />
          <div className="w-1 h-4 bg-gray-700 dark:bg-gray-500 group-hover:bg-gray-600 dark:group-hover:bg-gray-400 rounded-sm" />
        </div>
        <EyeIcon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 group-hover:text-gray-400 dark:group-hover:text-gray-300" />
      </button>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
          {game.sport}
        </span>
        {isLive && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            LIVE
          </span>
        )}
        {isFinal && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            FINAL
          </span>
        )}
      </div>

      <div className="space-y-2">
        {game.competitors.map((team, index) => (
          <div key={team.team.abbreviation} className="flex items-center gap-3">
            <div className="w-8 h-8 relative flex-shrink-0">
              <Image
                src={team.team.logo}
                alt={team.team.displayName}
                fill
                className="object-contain"
              />
            </div>
            <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
              {team.team.displayName}
            </span>
            <ScoreDisplay
              score={team.score}
              team={index === 0 ? "away" : "home"}
            />
          </div>
        ))}
      </div>

      {isLive && game.status.displayClock && (
        <p className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-center text-gray-500 dark:text-gray-400">
          {game.status.detail}
        </p>
      )}
    </div>
  );
}
