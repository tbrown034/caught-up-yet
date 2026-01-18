"use client";

import { useCallback, useRef, useState, useMemo } from "react";
import { SignalIcon } from "@heroicons/react/24/solid";
import {
  positionToPercentage,
  percentageToPosition,
  decodePosition,
} from "@/lib/position-encoding";
import { formatGamePosition } from "@/lib/game-position";

interface CompactTimelineProps {
  sport: "nfl" | "mlb" | "nba" | "nhl";
  positionEncoded: number;
  onChange: (newPosition: number) => void;
  livePositionEncoded: number | null;
  onGoLive?: () => void;
  isLive?: boolean;
  messagePositions?: number[];
}

export default function CompactTimeline({
  sport,
  positionEncoded,
  onChange,
  livePositionEncoded,
  onGoLive,
  isLive = false,
  messagePositions = [],
}: CompactTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const userPercent = positionToPercentage(positionEncoded, sport);
  const livePercent = livePositionEncoded
    ? positionToPercentage(livePositionEncoded, sport)
    : null;

  // Format current position for display
  const formattedPosition = useMemo(() => {
    const meta = decodePosition(positionEncoded, sport);
    return formatGamePosition(meta, sport);
  }, [positionEncoded, sport]);

  // Convert message positions to percentages for display
  const messageMarkerPercents = useMemo(() => {
    return messagePositions.map((pos) => ({
      percent: positionToPercentage(pos, sport),
      isAhead: pos > positionEncoded,
    }));
  }, [messagePositions, positionEncoded, sport]);

  // Count messages ahead and behind
  const messagesAhead = messageMarkerPercents.filter((m) => m.isAhead).length;
  const messagesBehind = messageMarkerPercents.filter((m) => !m.isAhead).length;

  const handleTrackInteraction = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const newPosition = percentageToPosition(percent, sport);

      onChange(newPosition);
    },
    [sport, onChange]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleTrackInteraction(e.clientX);
  };

  // Add/remove global mouse event listeners
  useState(() => {
    if (typeof window === "undefined") return;

    const onMove = (e: MouseEvent) => {
      if (isDragging) {
        handleTrackInteraction(e.clientX);
      }
    };

    const onUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  });

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleTrackInteraction(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleTrackInteraction(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const isBehindLive = livePercent !== null && userPercent < livePercent - 1;

  return (
    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
      {/* Position display and Go Live button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {formattedPosition}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({Math.round(userPercent)}%)
          </span>
        </div>

        {/* Go Live / Jump to End button */}
        {isBehindLive && onGoLive && (
          <button
            onClick={onGoLive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isLive
                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50"
            }`}
          >
            {isLive && <SignalIcon className="w-3 h-3" />}
            {isLive ? "Go Live" : "Jump to End"}
          </button>
        )}
      </div>

      {/* Timeline track */}
      <div
        ref={trackRef}
        className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer relative select-none mb-2"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Progress fill */}
        <div
          className="absolute top-0 left-0 h-full bg-blue-500/30 rounded-full transition-all duration-75"
          style={{ width: `${userPercent}%` }}
        />

        {/* Message markers */}
        {messageMarkerPercents.map((marker, idx) => (
          <div
            key={idx}
            className={`absolute top-0 w-0.5 h-full ${
              marker.isAhead
                ? "bg-green-400/50"
                : "bg-green-500"
            }`}
            style={{ left: `${marker.percent}%` }}
          />
        ))}

        {/* Live position marker */}
        {livePercent !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 z-10"
            style={{ left: `${livePercent}%` }}
          >
            <div
              className={`w-1 h-5 rounded-full ${
                isLive ? "bg-red-500" : "bg-amber-500"
              }`}
            />
          </div>
        )}

        {/* User position handle */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-600 rounded-full border-2 border-white dark:border-gray-900 shadow-lg z-20 transition-all duration-75 ${
            isDragging ? "scale-125" : ""
          }`}
          style={{ left: `calc(${userPercent}% - 10px)` }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">You</span>
          </div>
          {messagePositions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-0.5 bg-green-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Messages ({messagesBehind}
                {messagesAhead > 0 && (
                  <span className="text-gray-400 dark:text-gray-500">
                    +{messagesAhead} ahead
                  </span>
                )}
                )
              </span>
            </div>
          )}
          {livePercent !== null && (
            <div className="flex items-center gap-1.5">
              <div className={`w-1 h-2.5 rounded-full ${isLive ? "bg-red-500" : "bg-amber-500"}`} />
              <span className="text-gray-600 dark:text-gray-400">
                {isLive ? "Live" : "End"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
