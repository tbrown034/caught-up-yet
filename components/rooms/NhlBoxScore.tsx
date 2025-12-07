"use client";

import { useCallback, useRef, useMemo } from "react";
import type { GameData } from "@/lib/database.types";
import {
  decodeNhlPosition,
  getSegmentStartPosition,
  getSegmentEndPosition,
  positionToPercentage,
  percentageToPosition,
} from "@/lib/position-encoding";
import { getScoreAtPosition } from "@/lib/score-calculator";
import type { MessageMarkers } from "./BoxScorePosition";

interface NhlBoxScoreProps {
  positionEncoded: number;
  onChange: (newPositionEncoded: number) => void;
  gameData: GameData;
  messagePositions?: number[];
  messageMarkers?: MessageMarkers;
  livePositionEncoded?: number | null;
}

export default function NhlBoxScore({
  positionEncoded,
  onChange,
  gameData,
  messagePositions = [],
  messageMarkers,
  livePositionEncoded = null,
}: NhlBoxScoreProps) {
  const fullGameTrackRef = useRef<HTMLDivElement>(null);
  const periodTrackRef = useRef<HTMLDivElement>(null);
  const fullGamePointerIdRef = useRef<number | null>(null);
  const periodPointerIdRef = useRef<number | null>(null);

  const position = useMemo(
    () => decodeNhlPosition(positionEncoded),
    [positionEncoded]
  );

  const currentPeriod = position.period;

  // Full game progress (0-100%)
  const fullGameProgress = positionToPercentage(positionEncoded, "nhl");

  // Calculate current score based on position using scoring plays
  const currentScore = useMemo(() => {
    return getScoreAtPosition(gameData.scoringPlays, positionEncoded, "nhl");
  }, [gameData.scoringPlays, positionEncoded]);

  const periodStart = getSegmentStartPosition(currentPeriod, "nhl");
  const periodEnd = getSegmentEndPosition(currentPeriod, "nhl");
  const periodRange = periodEnd - periodStart;
  const positionInPeriod = positionEncoded - periodStart;
  const periodProgress = Math.min(
    100,
    Math.max(0, (positionInPeriod / periodRange) * 100)
  );

  // Get message markers for full game slider
  const fullGameMarkers = useMemo(() => {
    return messagePositions.map((pos) => ({
      position: pos,
      percent: positionToPercentage(pos, "nhl"),
    }));
  }, [messagePositions]);

  const periodMarkers = useMemo(() => {
    return messagePositions
      .filter((pos) => pos >= periodStart && pos <= periodEnd)
      .map((pos) => ({
        position: pos,
        percent: ((pos - periodStart) / periodRange) * 100,
      }));
  }, [messagePositions, periodStart, periodEnd, periodRange]);

  // Live position markers
  const fullGameLiveMarker = useMemo(() => {
    if (livePositionEncoded === null) return null;
    return positionToPercentage(livePositionEncoded, "nhl");
  }, [livePositionEncoded]);

  const periodLiveMarker = useMemo(() => {
    if (
      livePositionEncoded === null ||
      livePositionEncoded < periodStart ||
      livePositionEncoded > periodEnd
    ) {
      return null;
    }
    return ((livePositionEncoded - periodStart) / periodRange) * 100;
  }, [livePositionEncoded, periodStart, periodEnd, periodRange]);

  const handlePeriodSelect = useCallback(
    (period: 1 | 2 | 3) => {
      // Use position 1 second into the period to avoid boundary ambiguity
      // Position 0 = P1 20:00, Position 1200 = P1 0:00 (end of P1)
      // So P2 start should be 1201 (P2 19:59), not 1200 (P1 0:00)
      const basePosition = getSegmentStartPosition(period, "nhl");
      const newPosition = period === 1 ? 0 : basePosition + 1;
      onChange(newPosition);
    },
    [onChange]
  );

  // Full game slider change
  const handleFullGameSliderChange = useCallback(
    (percent: number) => {
      const newPosition = percentageToPosition(percent, "nhl");
      onChange(newPosition);
    },
    [onChange]
  );

  // Period slider change
  const handlePeriodSliderChange = useCallback(
    (percent: number) => {
      const clamped = Math.min(100, Math.max(0, percent));
      const newPosition = Math.round(
        periodStart + (clamped / 100) * periodRange
      );
      onChange(newPosition);
    },
    [periodStart, periodRange, onChange]
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

  // Period slider pointer handlers
  const handlePeriodPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      periodPointerIdRef.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
      updateFromClientX(
        event.clientX,
        periodTrackRef,
        handlePeriodSliderChange
      );
    },
    [updateFromClientX, handlePeriodSliderChange]
  );

  const handlePeriodPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (periodPointerIdRef.current !== event.pointerId) return;
      updateFromClientX(
        event.clientX,
        periodTrackRef,
        handlePeriodSliderChange
      );
    },
    [updateFromClientX, handlePeriodSliderChange]
  );

  const handlePeriodPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (periodPointerIdRef.current !== event.pointerId) return;
      periodPointerIdRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    },
    []
  );

  const formatTime = (mins: number, secs: number) => {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Team Scores Header */}
      <div className="bg-slate-800 text-white rounded-lg p-4">
        <div className="grid grid-cols-5 gap-2 text-center">
          <div className="col-span-1" />
          {[1, 2, 3].map((p) => (
            <div key={p} className="text-xs font-medium text-slate-400">
              P{p}
            </div>
          ))}
          <div className="text-xs font-medium text-slate-400">T</div>
        </div>
        <div className="grid grid-cols-5 gap-2 text-center mt-2">
          <div className="col-span-1 text-left text-sm font-semibold truncate">
            {gameData.awayTeam}
          </div>
          {[1, 2, 3].map((p) => {
            // Show score once user has moved past that period (into next period or later)
            const periodCompleted = currentPeriod > p;
            const hasScore = gameData.awayLinescores && gameData.awayLinescores[p - 1] !== undefined;
            return (
              <div
                key={p}
                className={`text-sm ${
                  periodCompleted ? "text-white" : "text-slate-600"
                }`}
              >
                {periodCompleted && hasScore ? gameData.awayLinescores![p - 1] : "-"}
              </div>
            );
          })}
          <div className="text-sm font-semibold text-yellow-400">
            {currentScore.away}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2 text-center mt-1">
          <div className="col-span-1 text-left text-sm font-semibold truncate">
            {gameData.homeTeam}
          </div>
          {[1, 2, 3].map((p) => {
            const periodCompleted = currentPeriod > p;
            const hasScore = gameData.homeLinescores && gameData.homeLinescores[p - 1] !== undefined;
            return (
              <div
                key={p}
                className={`text-sm ${
                  periodCompleted ? "text-white" : "text-slate-600"
                }`}
              >
                {periodCompleted && hasScore ? gameData.homeLinescores![p - 1] : "-"}
              </div>
            );
          })}
          <div className="text-sm font-semibold text-yellow-400">
            {currentScore.home}
          </div>
        </div>
      </div>

      {/* Full Game Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span className="font-medium">Full Game</span>
          <span>{Math.round(fullGameProgress)}% complete</span>
        </div>

        <div
          ref={fullGameTrackRef}
          onPointerDown={handleFullGamePointerDown}
          onPointerMove={handleFullGamePointerMove}
          onPointerUp={handleFullGamePointerUp}
          className="relative h-4 w-full cursor-pointer select-none rounded-full bg-gray-200"
        >
          {/* Period dividers */}
          {[1, 2].map((p) => (
            <div
              key={p}
              className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-gray-400 z-5"
              style={{ left: `${(p / 3) * 100}%` }}
            />
          ))}

          {/* Filled progress */}
          <div
            className="bg-slate-700 h-4 rounded-full transition-all duration-100"
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
            className="pointer-events-none absolute -top-1 h-6 w-6 rounded-full border-3 border-white bg-slate-700 shadow-lg z-20"
            style={{ left: `calc(${fullGameProgress}% - 12px)` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>P1</span>
          <span>P2</span>
          <span>P3</span>
          <span>END</span>
        </div>
      </div>

      {/* Period Selector */}
      <div className="grid grid-cols-3 gap-2">
        {([1, 2, 3] as const).map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodSelect(p)}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              currentPeriod === p
                ? "bg-slate-700 text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Period {p}
          </button>
        ))}
      </div>

      {/* Period Time Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Period {currentPeriod}</span>
          <span className="font-medium">
            {formatTime(position.minutes, position.seconds)}
          </span>
        </div>

        <div
          ref={periodTrackRef}
          onPointerDown={handlePeriodPointerDown}
          onPointerMove={handlePeriodPointerMove}
          onPointerUp={handlePeriodPointerUp}
          className="relative h-6 w-full cursor-pointer select-none rounded-full bg-gray-200"
        >
          <div
            className="bg-slate-700 h-6 rounded-full transition-all duration-100"
            style={{ width: `${periodProgress}%` }}
          />

          {periodMarkers.map((marker, idx) => (
            <div
              key={idx}
              className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-green-500 z-10"
              style={{ left: `${marker.percent}%` }}
            />
          ))}

          {periodLiveMarker !== null && (
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-1 bg-red-500 z-10 animate-pulse"
              style={{ left: `${periodLiveMarker}%` }}
            />
          )}

          <div
            className="pointer-events-none absolute -top-1 h-8 w-8 rounded-full border-4 border-white bg-slate-700 shadow-xl z-20"
            style={{ left: `calc(${periodProgress}% - 16px)` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>20:00</span>
          <span>0:00</span>
        </div>
      </div>
    </div>
  );
}
