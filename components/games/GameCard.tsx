"use client";

import { useState, useEffect } from "react";
import { ESPNGame } from "@/lib/espn-api";
import Image from "next/image";
import { UserGroupIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import CreateRoomModal from "@/components/rooms/CreateRoomModal";

interface GameCardProps {
  game: ESPNGame;
  spoilerProtection?: boolean;
  autoOpenModal?: boolean;
  onModalOpened?: () => void;
}

export default function GameCard({ game, spoilerProtection = true, autoOpenModal = false, onModalOpened }: GameCardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Auto-open modal when autoOpenModal prop is true
  useEffect(() => {
    if (autoOpenModal && !showCreateModal) {
      setShowCreateModal(true);
      onModalOpened?.();
    }
  }, [autoOpenModal, showCreateModal, onModalOpened]);
  const [revealedScores, setRevealedScores] = useState<{ away: boolean; home: boolean }>({
    away: false,
    home: false,
  });
  const awayTeam = game.competitors[0];
  const homeTeam = game.competitors[1];
  const isLive = game.status.type === "STATUS_IN_PROGRESS";
  const isFinal = game.status.type === "STATUS_FINAL";

  const gameTime = new Date(game.date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const handleToggleScore = (team: 'away' | 'home') => {
    setRevealedScores(prev => ({ ...prev, [team]: !prev[team] }));
  };

  const shouldHideScore = spoilerProtection && (isLive || isFinal);

  const ScoreDisplay = ({ score, team }: { score: string | undefined, team: 'away' | 'home' }) => {
    if (!score) return null;

    const isRevealed = revealedScores[team];

    // If protection is off, just show the score
    if (!shouldHideScore) {
      return (
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {score}
        </span>
      );
    }

    // If revealed, show score with hide button
    if (isRevealed) {
      return (
        <button
          onClick={() => handleToggleScore(team)}
          className="group flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border-2 border-blue-200 dark:border-blue-700 rounded transition-colors"
          title="Click to hide score"
        >
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {score}
          </span>
          <EyeSlashIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
        </button>
      );
    }

    // Hidden state - show redacted bars
    return (
      <button
        onClick={() => handleToggleScore(team)}
        className="group relative flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
        title="Click to reveal score"
      >
        <div className="flex gap-1">
          <div className="w-1.5 h-5 bg-gray-400 dark:bg-gray-500 group-hover:bg-gray-500 dark:group-hover:bg-gray-400 rounded"></div>
          <div className="w-1.5 h-5 bg-gray-400 dark:bg-gray-500 group-hover:bg-gray-500 dark:group-hover:bg-gray-400 rounded"></div>
          <div className="w-1.5 h-5 bg-gray-400 dark:bg-gray-500 group-hover:bg-gray-500 dark:group-hover:bg-gray-400 rounded"></div>
        </div>
        <EyeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
      </button>
    );
  };

  return (
    <>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
        {/* Status Badge */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            {game.sport.toUpperCase()}
          </span>
          {isLive && (
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded">
              LIVE
            </span>
          )}
          {isFinal && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded">
              FINAL
            </span>
          )}
          {!isLive && !isFinal && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{gameTime}</span>
          )}
        </div>

        {/* Teams */}
        <div className="space-y-3 sm:space-y-4">
          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Image
                src={awayTeam.team.logo}
                alt={awayTeam.team.displayName}
                width={48}
                height={48}
                className="object-contain w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                  {awayTeam.team.displayName}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {awayTeam.team.abbreviation}
                </p>
              </div>
            </div>
            <ScoreDisplay score={awayTeam.score} team="away" />
          </div>

          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <Image
                src={homeTeam.team.logo}
                alt={homeTeam.team.displayName}
                width={48}
                height={48}
                className="object-contain w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                  {homeTeam.team.displayName}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {homeTeam.team.abbreviation}
                </p>
              </div>
            </div>
            <ScoreDisplay score={homeTeam.score} team="home" />
          </div>
        </div>

        {/* Game Status Detail */}
        {isLive && game.status.displayClock && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">{game.status.detail}</p>
          </div>
        )}

        {/* Create Watch Party Button */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <UserGroupIcon className="w-5 h-5" />
            Create Watch Party
          </button>
        </div>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <CreateRoomModal
          game={game}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}
