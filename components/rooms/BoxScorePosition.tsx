"use client";

import { useCallback, useMemo } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import { SignalIcon } from "@heroicons/react/24/solid";
import type { GameData } from "@/lib/database.types";
import {
  decodePosition,
  positionToPercentage,
  getSegmentFromPosition,
} from "@/lib/position-encoding";
import { formatGamePosition } from "@/lib/game-position";
import NflBoxScore from "./NflBoxScore";
import NbaBoxScore from "./NbaBoxScore";
import NhlBoxScore from "./NhlBoxScore";
import MlbBoxScore from "./MlbBoxScore";

export interface MessageMarkers {
  own: number[];
  others: number[];
  ownPast: number[];
  ownFuture: number[];
  othersPast: number[];
  othersFuture: number[];
}

interface BoxScorePositionProps {
  sport: "nfl" | "mlb" | "nba" | "nhl" | "cfb";
  positionEncoded: number;
  onChange: (newPositionEncoded: number) => void;
  gameData: GameData;
  messagePositions?: number[]; // Legacy - will be deprecated
  messageMarkers?: MessageMarkers; // New colored markers
  livePositionEncoded?: number | null;
  onGoLive?: () => void;
}

function getGameStatusType(gameData: GameData): string {
  if (!gameData?.status) return "";
  return typeof gameData.status === "string"
    ? gameData.status
    : gameData.status.type || "";
}

export default function BoxScorePosition({
  sport,
  positionEncoded,
  onChange,
  gameData,
  messagePositions = [],
  messageMarkers,
  livePositionEncoded = null,
  onGoLive,
}: BoxScorePositionProps) {
  const positionMeta = useMemo(
    () => decodePosition(positionEncoded, sport),
    [positionEncoded, sport]
  );

  const percentage = useMemo(
    () => positionToPercentage(positionEncoded, sport),
    [positionEncoded, sport]
  );

  const currentSegment = useMemo(
    () => getSegmentFromPosition(positionEncoded, sport),
    [positionEncoded, sport]
  );

  const formattedPosition = useMemo(
    () => formatGamePosition(positionMeta, sport),
    [positionMeta, sport]
  );

  const handlePositionChange = useCallback(
    (newEncoded: number) => {
      onChange(newEncoded);
    },
    [onChange]
  );

  // Determine button text and style based on game status
  const statusType = getGameStatusType(gameData);
  const isLive = statusType === "STATUS_IN_PROGRESS" || statusType === "IN_PROGRESS" || statusType === "LIVE";
  const isFinished = statusType === "STATUS_FINAL" || statusType === "POST" || statusType === "FINAL";

  const showGoLiveButton = livePositionEncoded !== null && onGoLive;

  // Format the live position for display (e.g., "Q3 8:42")
  const formattedLivePosition = useMemo(() => {
    if (livePositionEncoded === null) return null;
    const livePosMeta = decodePosition(livePositionEncoded, sport);
    return formatGamePosition(livePosMeta, sport);
  }, [livePositionEncoded, sport]);

  // Calculate how far behind live the user is
  const behindLivePercent = useMemo(() => {
    if (livePositionEncoded === null) return 0;
    const livePercent = positionToPercentage(livePositionEncoded, sport);
    const userPercent = positionToPercentage(positionEncoded, sport);
    return Math.max(0, livePercent - userPercent);
  }, [livePositionEncoded, positionEncoded, sport]);

  const isAtLive = behindLivePercent < 1; // Within 1% is "at live"

  const renderSportSpecificUI = () => {
    switch (sport) {
      case "nfl":
      case "cfb": // College football uses same format as NFL
        return (
          <NflBoxScore
            positionEncoded={positionEncoded}
            onChange={handlePositionChange}
            gameData={gameData}
            messagePositions={messagePositions}
            messageMarkers={messageMarkers}
            livePositionEncoded={livePositionEncoded}
          />
        );
      case "nba":
        return (
          <NbaBoxScore
            positionEncoded={positionEncoded}
            onChange={handlePositionChange}
            gameData={gameData}
            messagePositions={messagePositions}
            messageMarkers={messageMarkers}
            livePositionEncoded={livePositionEncoded}
          />
        );
      case "nhl":
        return (
          <NhlBoxScore
            positionEncoded={positionEncoded}
            onChange={handlePositionChange}
            gameData={gameData}
            messagePositions={messagePositions}
            messageMarkers={messageMarkers}
            livePositionEncoded={livePositionEncoded}
          />
        );
      case "mlb":
        return (
          <MlbBoxScore
            positionEncoded={positionEncoded}
            onChange={handlePositionChange}
            gameData={gameData}
            messagePositions={messagePositions}
            messageMarkers={messageMarkers}
            livePositionEncoded={livePositionEncoded}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            <span className="font-semibold">Your Position</span>
          </div>
          <div className="flex items-center gap-3">
            {showGoLiveButton && !isAtLive && (
              <button
                onClick={onGoLive}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] ${
                  isLive
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-gray-900"
                }`}
                title={`Jump to ${isLive ? "live" : "end"} position: ${formattedLivePosition}`}
              >
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? "bg-white animate-ping" : "bg-gray-800"}`} />
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${isLive ? "bg-white" : "bg-gray-800"}`} />
                </span>
                <span className="flex flex-col items-start leading-tight">
                  <span>{isLive ? "Go Live" : "Jump to End"}</span>
                  <span className="text-xs opacity-80 font-normal">
                    {formattedLivePosition}
                  </span>
                </span>
              </button>
            )}
            <div className="text-right">
              <div className="text-2xl font-bold">{formattedPosition}</div>
              <div className="text-sm text-blue-100">
                {percentage.toFixed(0)}% through game
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sport-specific box score UI */}
      <div className="p-4">{renderSportSpecificUI()}</div>

      {/* Legend */}
      <div className="border-t border-gray-200 bg-gray-50 p-3">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span>Your position</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1 bg-green-500" />
            <span>Comments ({messagePositions.length})</span>
          </div>
          {livePositionEncoded !== null && (
            <div className="flex items-center gap-1.5">
              <SignalIcon className="w-3 h-3 text-red-500" />
              <span>Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Spoiler Protection Reminder */}
      <div className="border-t border-blue-100 bg-blue-50 p-3">
        <p className="text-xs text-blue-800 text-center">
          Move the slider to your current viewing position.
          {messagePositions.length > 0
            ? " Green markers show where comments were posted."
            : " Be the first to leave a comment!"}
        </p>
      </div>
    </div>
  );
}
