"use client";

import { useCallback, useRef, useMemo } from "react";
import type { GameData } from "@/lib/database.types";
import {
  decodeNbaPosition,
  getSegmentStartPosition,
  getSegmentEndPosition,
  positionToPercentage,
  percentageToPosition,
} from "@/lib/position-encoding";
import { getScoreAtPosition } from "@/lib/score-calculator";
import type { MessageMarkers } from "./BoxScorePosition";

interface NbaBoxScoreProps {
  positionEncoded: number;
  onChange: (newPositionEncoded: number) => void;
  gameData: GameData;
  messagePositions?: number[];
  messageMarkers?: MessageMarkers;
  livePositionEncoded?: number | null;
}

export default function NbaBoxScore({
  positionEncoded,
  onChange,
  gameData,
  messagePositions = [],
  messageMarkers,
  livePositionEncoded = null,
}: NbaBoxScoreProps) {
  const fullGameTrackRef = useRef<HTMLDivElement>(null);
  const quarterTrackRef = useRef<HTMLDivElement>(null);
  const fullGamePointerIdRef = useRef<number | null>(null);
  const quarterPointerIdRef = useRef<number | null>(null);

  const position = useMemo(
    () => decodeNbaPosition(positionEncoded),
    [positionEncoded]
  );

  const currentQuarter = position.quarter;

  // Full game progress (0-100%)
  const fullGameProgress = positionToPercentage(positionEncoded, "nba");

  // Calculate current score based on position using scoring plays
  const currentScore = useMemo(() => {
    return getScoreAtPosition(gameData.scoringPlays, positionEncoded, "nba");
  }, [gameData.scoringPlays, positionEncoded]);

  const quarterStart = getSegmentStartPosition(currentQuarter, "nba");
  const quarterEnd = getSegmentEndPosition(currentQuarter, "nba");
  const quarterRange = quarterEnd - quarterStart;
  const positionInQuarter = positionEncoded - quarterStart;
  const quarterProgress = Math.min(
    100,
    Math.max(0, (positionInQuarter / quarterRange) * 100)
  );

  // Get message markers for full game slider
  const fullGameMarkers = useMemo(() => {
    return messagePositions.map((pos) => ({
      position: pos,
      percent: positionToPercentage(pos, "nba"),
    }));
  }, [messagePositions]);

  const quarterMarkers = useMemo(() => {
    return messagePositions
      .filter((pos) => pos >= quarterStart && pos <= quarterEnd)
      .map((pos) => ({
        position: pos,
        percent: ((pos - quarterStart) / quarterRange) * 100,
      }));
  }, [messagePositions, quarterStart, quarterEnd, quarterRange]);

  // Live position markers
  const fullGameLiveMarker = useMemo(() => {
    if (livePositionEncoded === null) return null;
    return positionToPercentage(livePositionEncoded, "nba");
  }, [livePositionEncoded]);

  const quarterLiveMarker = useMemo(() => {
    if (
      livePositionEncoded === null ||
      livePositionEncoded < quarterStart ||
      livePositionEncoded > quarterEnd
    ) {
      return null;
    }
    return ((livePositionEncoded - quarterStart) / quarterRange) * 100;
  }, [livePositionEncoded, quarterStart, quarterEnd, quarterRange]);

  const handleQuarterSelect = useCallback(
    (quarter: 1 | 2 | 3 | 4) => {
      // Use position 1 second into the quarter to avoid boundary ambiguity
      // Position 0 = Q1 12:00, Position 720 = Q1 0:00 (end of Q1)
      // So Q2 start should be 721 (Q2 11:59), not 720 (Q1 0:00)
      const basePosition = getSegmentStartPosition(quarter, "nba");
      const newPosition = quarter === 1 ? 0 : basePosition + 1;
      onChange(newPosition);
    },
    [onChange]
  );

  // Full game slider change
  const handleFullGameSliderChange = useCallback(
    (percent: number) => {
      const newPosition = percentageToPosition(percent, "nba");
      onChange(newPosition);
    },
    [onChange]
  );

  // Quarter slider change
  const handleQuarterSliderChange = useCallback(
    (percent: number) => {
      const clamped = Math.min(100, Math.max(0, percent));
      const newPosition = Math.round(
        quarterStart + (clamped / 100) * quarterRange
      );
      onChange(newPosition);
    },
    [quarterStart, quarterRange, onChange]
  );

  const updateFromClientX = useCallback(
    (
      clientX: number,
      trackRef: React.RefObject<HTMLDivElement | null>,
      handleChange: (percent: number) => void
    ) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = (clientX - rect.left) / rect.width;
      handleChange(ratio * 100);
    },
    []
  );

  // Full game slider pointer handlers
  const handleFullGamePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      fullGamePointerIdRef.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
      updateFromClientX(
        event.clientX,
        fullGameTrackRef,
        handleFullGameSliderChange
      );
    },
    [updateFromClientX, handleFullGameSliderChange]
  );

  const handleFullGamePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (fullGamePointerIdRef.current !== event.pointerId) return;
      updateFromClientX(
        event.clientX,
        fullGameTrackRef,
        handleFullGameSliderChange
      );
    },
    [updateFromClientX, handleFullGameSliderChange]
  );

  const handleFullGamePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (fullGamePointerIdRef.current !== event.pointerId) return;
      fullGamePointerIdRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    },
    []
  );

  // Quarter slider pointer handlers
  const handleQuarterPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      quarterPointerIdRef.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
      updateFromClientX(
        event.clientX,
        quarterTrackRef,
        handleQuarterSliderChange
      );
    },
    [updateFromClientX, handleQuarterSliderChange]
  );

  const handleQuarterPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (quarterPointerIdRef.current !== event.pointerId) return;
      updateFromClientX(
        event.clientX,
        quarterTrackRef,
        handleQuarterSliderChange
      );
    },
    [updateFromClientX, handleQuarterSliderChange]
  );

  const handleQuarterPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (quarterPointerIdRef.current !== event.pointerId) return;
      quarterPointerIdRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    },
    []
  );

  const formatTime = (mins: number, secs: number) => {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-3">
      {/* Team Scores Header */}
      <div className="bg-slate-800 text-white rounded-lg p-4">
        <div className="grid grid-cols-6 gap-2 text-center">
          <div className="col-span-1" />
          {[1, 2, 3, 4].map((q) => (
            <div key={q} className="text-xs font-medium text-slate-400">
              Q{q}
            </div>
          ))}
          <div className="text-xs font-medium text-slate-400">T</div>
        </div>
        <div className="grid grid-cols-6 gap-2 text-center mt-2">
          <div className="col-span-1 text-left text-sm font-semibold truncate">
            {gameData.awayTeam}
          </div>
          {[1, 2, 3, 4].map((q) => {
            const quarterCompleted = currentQuarter > q;
            const hasScore = gameData.awayLinescores && gameData.awayLinescores[q - 1] !== undefined;
            return (
              <div
                key={q}
                className={`text-sm ${
                  quarterCompleted ? "text-white" : "text-slate-500"
                }`}
              >
                {quarterCompleted && hasScore ? gameData.awayLinescores![q - 1] : "-"}
              </div>
            );
          })}
          <div className="text-sm font-semibold text-blue-400">
            {currentScore.away}
          </div>
        </div>
        <div className="grid grid-cols-6 gap-2 text-center mt-1">
          <div className="col-span-1 text-left text-sm font-semibold truncate">
            {gameData.homeTeam}
          </div>
          {[1, 2, 3, 4].map((q) => {
            const quarterCompleted = currentQuarter > q;
            const hasScore = gameData.homeLinescores && gameData.homeLinescores[q - 1] !== undefined;
            return (
              <div
                key={q}
                className={`text-sm ${
                  quarterCompleted ? "text-white" : "text-slate-500"
                }`}
              >
                {quarterCompleted && hasScore ? gameData.homeLinescores![q - 1] : "-"}
              </div>
            );
          })}
          <div className="text-sm font-semibold text-blue-400">
            {currentScore.home}
          </div>
        </div>
      </div>

      {/* Full Game Slider - PRIMARY */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <span>Full Game</span>
          <span className="text-blue-600">{Math.round(fullGameProgress)}% complete</span>
        </div>

        <div
          ref={fullGameTrackRef}
          onPointerDown={handleFullGamePointerDown}
          onPointerMove={handleFullGamePointerMove}
          onPointerUp={handleFullGamePointerUp}
          className="relative h-6 w-full cursor-pointer select-none rounded-full bg-gray-200"
        >
          {/* Quarter dividers */}
          {[1, 2, 3].map((q) => (
            <div
              key={q}
              className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-gray-400 z-5"
              style={{ left: `${(q / 4) * 100}%` }}
            />
          ))}

          {/* Filled progress */}
          <div
            className="bg-blue-600 h-6 rounded-full transition-all duration-100"
            style={{ width: `${fullGameProgress}%` }}
          />

          {/* Message markers */}
          {fullGameMarkers.map((marker, idx) => (
            <div
              key={idx}
              className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-green-500 z-10"
              style={{ left: `${marker.percent}%` }}
            />
          ))}

          {/* Live position marker */}
          {fullGameLiveMarker !== null && (
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-1 bg-red-500 z-10 animate-pulse"
              style={{ left: `${fullGameLiveMarker}%` }}
            />
          )}

          {/* Handle */}
          <div
            className="pointer-events-none absolute -top-1 h-8 w-8 rounded-full border-3 border-white bg-blue-600 shadow-lg z-20"
            style={{ left: `calc(${fullGameProgress}% - 16px)` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>Q1</span>
          <span>Q2</span>
          <span>Q3</span>
          <span>Q4</span>
          <span>END</span>
        </div>
      </div>

      {/* Quarter Selector - Compact */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 mr-1">Jump to:</span>
        {([1, 2, 3, 4] as const).map((q) => (
          <button
            key={q}
            onClick={() => handleQuarterSelect(q)}
            className={`py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
              currentQuarter === q
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            }`}
          >
            Q{q}
          </button>
        ))}
      </div>

      {/* Quarter Time Slider - SECONDARY */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Quarter {currentQuarter}</span>
          <span className="font-medium">
            {formatTime(position.minutes, position.seconds)}
          </span>
        </div>

        <div
          ref={quarterTrackRef}
          onPointerDown={handleQuarterPointerDown}
          onPointerMove={handleQuarterPointerMove}
          onPointerUp={handleQuarterPointerUp}
          className="relative h-4 w-full cursor-pointer select-none rounded-full bg-gray-200"
        >
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-100"
            style={{ width: `${quarterProgress}%` }}
          />

          {quarterMarkers.map((marker, idx) => (
            <div
              key={idx}
              className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-green-500 z-10"
              style={{ left: `${marker.percent}%` }}
            />
          ))}

          {quarterLiveMarker !== null && (
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-1 bg-red-500 z-10 animate-pulse"
              style={{ left: `${quarterLiveMarker}%` }}
            />
          )}

          <div
            className="pointer-events-none absolute -top-1 h-6 w-6 rounded-full border-2 border-white bg-blue-600 shadow-md z-20"
            style={{ left: `calc(${quarterProgress}% - 12px)` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>12:00</span>
          <span>0:00</span>
        </div>
      </div>
    </div>
  );
}
