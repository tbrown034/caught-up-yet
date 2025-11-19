"use client";

import { useCallback, useMemo } from "react";
import { Clock, Radio } from "lucide-react";
import type { GameData } from "@/lib/database.types";
import {
  decodePosition,
  encodePosition,
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
  sport: "nfl" | "mlb" | "nba" | "nhl";
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

  const goLiveButtonText = isLive ? "Jump to Live" : isFinished ? "Jump to End" : "Jump to Live";
  const showGoLiveButton = livePositionEncoded !== null && onGoLive;

  const renderSportSpecificUI = () => {
    switch (sport) {
      case "nfl":
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Your Position</span>
          </div>
          <div className="flex items-center gap-3">
            {showGoLiveButton && (
              <button
                onClick={onGoLive}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  isLive
                    ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                    : "bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                }`}
                title={goLiveButtonText}
              >
                <Radio className={`w-5 h-5 ${isLive ? "animate-pulse" : ""}`} />
                {goLiveButtonText}
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
              <Radio className="w-3 h-3 text-red-500" />
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
