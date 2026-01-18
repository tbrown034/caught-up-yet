"use client";

import { useState } from "react";
import { Bars3Icon, LockClosedIcon, ChevronDownIcon, ChevronUpIcon, CalendarIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { formatGamePosition } from "@/lib/game-position";
import { decodePosition, positionToPercentage } from "@/lib/position-encoding";
import type { GameData } from "@/lib/database.types";

interface GameInfoPanelProps {
  sport: "nfl" | "mlb" | "nba" | "nhl";
  positionEncoded: number;
  gameStatus: string | null;
  showSpoilers: boolean;
  onMenuClick: () => void;
  gameData: GameData;
  currentScore?: { homeScore: number; awayScore: number } | null;
}

export default function GameInfoPanel({
  sport,
  positionEncoded,
  gameStatus,
  showSpoilers,
  onMenuClick,
  gameData,
  currentScore,
}: GameInfoPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const positionMeta = decodePosition(positionEncoded, sport);
  const formattedPosition = formatGamePosition(positionMeta, sport);
  const percentage = positionToPercentage(positionEncoded, sport);

  const isLive = gameStatus === "STATUS_IN_PROGRESS" || gameStatus === "IN_PROGRESS" || gameStatus === "LIVE";
  const isFinal = gameStatus === "STATUS_FINAL" || gameStatus === "POST" || gameStatus === "FINAL";

  // Get team abbreviations
  const getTeamAbbr = (teamName: string) => {
    const abbrs: Record<string, string> = {
      "Los Angeles Rams": "LAR",
      "Los Angeles Chargers": "LAC",
      "Los Angeles Lakers": "LAL",
      "Los Angeles Clippers": "LAC",
      "Los Angeles Dodgers": "LAD",
      "Los Angeles Angels": "LAA",
      "New York Giants": "NYG",
      "New York Jets": "NYJ",
      "New York Yankees": "NYY",
      "New York Mets": "NYM",
      "New York Knicks": "NYK",
      "New York Rangers": "NYR",
      "San Francisco 49ers": "SF",
      "San Francisco Giants": "SF",
      "Chicago Bears": "CHI",
      "Chicago Bulls": "CHI",
      "Chicago Cubs": "CHC",
      "Chicago White Sox": "CWS",
      "Chicago Blackhawks": "CHI",
    };
    return abbrs[teamName] || teamName.substring(0, 3).toUpperCase();
  };

  const awayAbbr = getTeamAbbr(gameData?.awayTeam || "AWY");
  const homeAbbr = getTeamAbbr(gameData?.homeTeam || "HME");

  // Use currentScore if provided, otherwise fall back to gameData scores
  const awayScore = currentScore?.awayScore ?? gameData?.awayScore ?? 0;
  const homeScore = currentScore?.homeScore ?? gameData?.homeScore ?? 0;

  // Get period labels based on sport
  const getPeriodLabels = () => {
    switch (sport) {
      case "nfl":
        return ["1", "2", "3", "4"];
      case "nba":
        return ["1", "2", "3", "4"];
      case "nhl":
        return ["1", "2", "3"];
      case "mlb":
        // MLB can have many innings, show first 9 by default
        const maxInnings = Math.max(
          gameData?.homeLinescores?.length || 9,
          gameData?.awayLinescores?.length || 9,
          9
        );
        return Array.from({ length: maxInnings }, (_, i) => String(i + 1));
      default:
        return ["1", "2", "3", "4"];
    }
  };

  const periodLabels = getPeriodLabels();

  // Format game date
  const formatGameDate = () => {
    if (!gameData?.gameDate) return null;
    const date = new Date(gameData.gameDate);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {/* Main compact row */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Expand button + Score */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          )}

          {/* Score display */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 dark:text-white">{awayAbbr}</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {awayScore} - {homeScore}
            </span>
            <span className="font-bold text-gray-900 dark:text-white">{homeAbbr}</span>
          </div>

          {/* Status badge */}
          {isLive && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
              </span>
              <span className="text-xs font-bold text-red-700 dark:text-red-400">LIVE</span>
            </span>
          )}
          {isFinal && (
            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">FINAL</span>
            </span>
          )}
        </button>

        {/* Right: Position + Menu */}
        <div className="flex items-center gap-3">
          {/* Position pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              {formattedPosition}
            </span>
            <span className="text-xs text-blue-500 dark:text-blue-500">
              ({Math.round(percentage)}%)
            </span>
            {!showSpoilers && (
              <LockClosedIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            )}
          </div>

          {/* Menu button */}
          <button
            onClick={onMenuClick}
            className="p-2 -mr-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Expanded box score section */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-4 bg-gray-50 dark:bg-gray-900/50">
          {/* Full team names */}
          <div className="mb-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {gameData?.awayTeam} @ {gameData?.homeTeam}
              </p>
              {gameData?.gameDate && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  {formatGameDate()}
                </p>
              )}
              {gameData?.venue && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center justify-center gap-1">
                  <MapPinIcon className="w-3 h-3" />
                  {gameData.venue}
                </p>
              )}
            </div>
          </div>

          {/* Box Score Table */}
          {(gameData?.homeLinescores || gameData?.awayLinescores) && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2 font-medium text-gray-500 dark:text-gray-400 w-24">
                      Team
                    </th>
                    {periodLabels.map((label) => (
                      <th
                        key={label}
                        className="text-center py-2 px-1 font-medium text-gray-500 dark:text-gray-400 w-8"
                      >
                        {label}
                      </th>
                    ))}
                    <th className="text-center py-2 px-2 font-bold text-gray-700 dark:text-gray-200 w-12">
                      {sport === "mlb" ? "R" : "T"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Away team */}
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 px-2 font-semibold text-gray-900 dark:text-white">
                      {awayAbbr}
                    </td>
                    {periodLabels.map((_, idx) => (
                      <td
                        key={idx}
                        className="text-center py-2 px-1 text-gray-600 dark:text-gray-300 font-mono"
                      >
                        {gameData?.awayLinescores?.[idx] ?? "-"}
                      </td>
                    ))}
                    <td className="text-center py-2 px-2 font-bold text-gray-900 dark:text-white">
                      {awayScore}
                    </td>
                  </tr>
                  {/* Home team */}
                  <tr>
                    <td className="py-2 px-2 font-semibold text-gray-900 dark:text-white">
                      {homeAbbr}
                    </td>
                    {periodLabels.map((_, idx) => (
                      <td
                        key={idx}
                        className="text-center py-2 px-1 text-gray-600 dark:text-gray-300 font-mono"
                      >
                        {gameData?.homeLinescores?.[idx] ?? "-"}
                      </td>
                    ))}
                    <td className="text-center py-2 px-2 font-bold text-gray-900 dark:text-white">
                      {homeScore}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Fallback if no linescores */}
          {!gameData?.homeLinescores && !gameData?.awayLinescores && (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Box score details not available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
