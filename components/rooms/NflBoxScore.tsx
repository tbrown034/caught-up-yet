"use client";

import { useCallback, useRef, useMemo } from "react";
import type { GameData } from "@/lib/database.types";
import {
  decodeNflPosition,
  getSegmentStartPosition,
  getSegmentEndPosition,
  positionToPercentage,
  percentageToPosition,
  getMaxPosition,
  getPositionLabel,
  isAtSegmentBoundary,
  hasOvertime,
  getMaxPositionWithOT,
  getOvertimePeriods,
} from "@/lib/position-encoding";
import { getScoreAtPosition } from "@/lib/score-calculator";

import type { MessageMarkers } from "./BoxScorePosition";

interface NflBoxScoreProps {
  positionEncoded: number;
  onChange: (newPositionEncoded: number) => void;
  gameData: GameData;
  messagePositions?: number[];
  messageMarkers?: MessageMarkers;
  livePositionEncoded?: number | null;
}

export default function NflBoxScore({
  positionEncoded,
  onChange,
  gameData,
  messagePositions = [],
  messageMarkers,
  livePositionEncoded = null,
}: NflBoxScoreProps) {
  const fullGameTrackRef = useRef<HTMLDivElement>(null);
  const quarterTrackRef = useRef<HTMLDivElement>(null);
  const fullGamePointerIdRef = useRef<number | null>(null);
  const quarterPointerIdRef = useRef<number | null>(null);

  const position = useMemo(
    () => decodeNflPosition(positionEncoded),
    [positionEncoded]
  );

  const currentQuarter = position.quarter;

  // Check if game has OT
  const gameHasOT = useMemo(() => {
    return hasOvertime(gameData.scoringPlays, "nfl");
  }, [gameData.scoringPlays]);

  const otPeriods = useMemo(() => {
    return getOvertimePeriods(gameData.scoringPlays, "nfl");
  }, [gameData.scoringPlays]);

  const maxPosition = useMemo(() => {
    return gameHasOT
      ? getMaxPositionWithOT("nfl", otPeriods)
      : getMaxPosition("nfl");
  }, [gameHasOT, otPeriods]);

  // Full game progress (0-100%)
  const fullGameProgress = useMemo(() => {
    return Math.min(100, Math.max(0, (positionEncoded / maxPosition) * 100));
  }, [positionEncoded, maxPosition]);

  // Calculate current score based on position using scoring plays
  const currentScore = useMemo(() => {
    return getScoreAtPosition(gameData.scoringPlays, positionEncoded, "nfl");
  }, [gameData.scoringPlays, positionEncoded]);

  // Calculate percentage within current quarter
  const quarterStart = getSegmentStartPosition(currentQuarter, "nfl");
  const quarterEnd = getSegmentEndPosition(currentQuarter, "nfl");
  const quarterRange = quarterEnd - quarterStart;
  const positionInQuarter = positionEncoded - quarterStart;
  const quarterProgress = Math.min(
    100,
    Math.max(0, (positionInQuarter / quarterRange) * 100)
  );

  // Get message markers for full game slider with colors
  const fullGameMarkers = useMemo(() => {
    if (!messageMarkers) {
      // Fallback to legacy messagePositions
      return {
        own: messagePositions.map((pos) => ({
          position: pos,
          percent: positionToPercentage(pos, "nfl"),
        })),
        others: [],
      };
    }

    return {
      own: messageMarkers.own.map((pos) => ({
        position: pos,
        percent: positionToPercentage(pos, "nfl"),
      })),
      others: messageMarkers.others.map((pos) => ({
        position: pos,
        percent: positionToPercentage(pos, "nfl"),
      })),
    };
  }, [messageMarkers, messagePositions]);

  // Get message markers within current quarter with colors
  const quarterMarkers = useMemo(() => {
    if (!messageMarkers) {
      // Fallback to legacy messagePositions
      return {
        own: messagePositions
          .filter((pos) => pos >= quarterStart && pos <= quarterEnd)
          .map((pos) => ({
            position: pos,
            percent: ((pos - quarterStart) / quarterRange) * 100,
          })),
        others: [],
      };
    }

    return {
      own: messageMarkers.own
        .filter((pos) => pos >= quarterStart && pos <= quarterEnd)
        .map((pos) => ({
          position: pos,
          percent: ((pos - quarterStart) / quarterRange) * 100,
        })),
      others: messageMarkers.others
        .filter((pos) => pos >= quarterStart && pos <= quarterEnd)
        .map((pos) => ({
          position: pos,
          percent: ((pos - quarterStart) / quarterRange) * 100,
        })),
    };
  }, [messageMarkers, messagePositions, quarterStart, quarterEnd, quarterRange]);

  // Live position markers
  const fullGameLiveMarker = useMemo(() => {
    if (livePositionEncoded === null) return null;
    return positionToPercentage(livePositionEncoded, "nfl");
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
    (quarter: 1 | 2 | 3 | 4 | 5) => {
      const newPosition = getSegmentStartPosition(quarter, "nfl");
      onChange(newPosition);
    },
    [onChange]
  );

  // Full game slider change
  const handleFullGameSliderChange = useCallback(
    (percent: number) => {
      const newPosition = percentageToPosition(percent, "nfl");
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

  // Get special position label if at boundary
  const positionLabel = useMemo(() => {
    return getPositionLabel(positionEncoded, "nfl");
  }, [positionEncoded]);

  const isBoundary = useMemo(() => {
    return isAtSegmentBoundary(positionEncoded, "nfl");
  }, [positionEncoded]);

  // Preset positions for quick access
  const presetPositions = useMemo(() => {
    const presets = [
      { label: "Start", position: 0, encoded: 0 },
      { label: "End Q1", position: 900, encoded: 900 },
      { label: "Halftime", position: 1800, encoded: 1800 },
      { label: "End Q3", position: 2700, encoded: 2700 },
    ];

    if (gameHasOT) {
      presets.push({ label: "End Q4", position: 3600, encoded: 3600 });
      presets.push({ label: "End OT", position: maxPosition, encoded: maxPosition });
    } else {
      presets.push({ label: "End", position: 3599, encoded: 3599 });
    }

    return presets;
  }, [gameHasOT, maxPosition]);

  return (
    <div className="space-y-4">
      {/* Team Scores Header */}
      <div className="bg-gray-900 text-white rounded-lg p-4">
        <div className={`grid gap-2 text-center ${gameHasOT ? 'grid-cols-7' : 'grid-cols-6'}`}>
          <div className="col-span-1" />
          {[1, 2, 3, 4].map((q) => (
            <div key={q} className="text-xs font-medium text-gray-400">
              Q{q}
            </div>
          ))}
          {gameHasOT && (
            <div className="text-xs font-medium text-yellow-400">OT</div>
          )}
          <div className="text-xs font-medium text-gray-400">T</div>
        </div>
        <div className={`grid gap-2 text-center mt-2 ${gameHasOT ? 'grid-cols-7' : 'grid-cols-6'}`}>
          <div className="col-span-1 text-left text-sm font-semibold truncate">
            {gameData.awayTeam}
          </div>
          {[1, 2, 3, 4].map((q) => {
            // Show score only if user has completed that quarter (past its end)
            const quarterCompleted = currentQuarter > q;
            const hasScore = gameData.awayLinescores && gameData.awayLinescores[q - 1] !== undefined;
            return (
              <div
                key={q}
                className={`text-sm ${
                  quarterCompleted ? "text-white" : "text-gray-600"
                }`}
              >
                {quarterCompleted && hasScore ? gameData.awayLinescores![q - 1] : "-"}
              </div>
            );
          })}
          {gameHasOT && (
            <div className={`text-sm ${currentQuarter > 5 ? "text-white" : "text-gray-600"}`}>
              {currentQuarter > 5 && gameData.awayLinescores?.[4] !== undefined
                ? gameData.awayLinescores[4]
                : "-"}
            </div>
          )}
          <div className="text-sm font-semibold text-yellow-400">
            {currentScore.away}
          </div>
        </div>
        <div className={`grid gap-2 text-center mt-1 ${gameHasOT ? 'grid-cols-7' : 'grid-cols-6'}`}>
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
                  quarterCompleted ? "text-white" : "text-gray-600"
                }`}
              >
                {quarterCompleted && hasScore ? gameData.homeLinescores![q - 1] : "-"}
              </div>
            );
          })}
          {gameHasOT && (
            <div className={`text-sm ${currentQuarter > 5 ? "text-white" : "text-gray-600"}`}>
              {currentQuarter > 5 && gameData.homeLinescores?.[4] !== undefined
                ? gameData.homeLinescores[4]
                : "-"}
            </div>
          )}
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
            className="bg-blue-600 h-4 rounded-full transition-all duration-100"
            style={{ width: `${fullGameProgress}%` }}
          />

          {/* Message markers - Own messages (blue) */}
          {fullGameMarkers.own.map((marker, idx) => (
            <div
              key={`own-${idx}`}
              className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
              style={{ left: `${marker.percent}%` }}
            />
          ))}

          {/* Message markers - Others' messages (gray) */}
          {fullGameMarkers.others.map((marker, idx) => (
            <div
              key={`others-${idx}`}
              className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
              style={{ left: `${marker.percent}%` }}
            />
          ))}

          {/* Live position marker (green) */}
          {fullGameLiveMarker !== null && (
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-1 bg-green-500 z-10 animate-pulse"
              style={{ left: `${fullGameLiveMarker}%` }}
              title="Live position"
            />
          )}

          {/* Handle */}
          <div
            className="pointer-events-none absolute -top-1 h-6 w-6 rounded-full border-3 border-white bg-blue-600 shadow-lg z-20"
            style={{ left: `calc(${fullGameProgress}% - 12px)` }}
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

      {/* Position Presets */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-500">Quick Jump</div>
        <div className="flex gap-2 flex-wrap">
          {presetPositions.map((preset) => (
            <button
              key={preset.label}
              onClick={() => onChange(preset.encoded)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                positionEncoded === preset.encoded
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quarter Selector */}
      <div className={`grid gap-2 ${gameHasOT ? 'grid-cols-5' : 'grid-cols-4'}`}>
        {([1, 2, 3, 4] as const).map((q) => (
          <button
            key={q}
            onClick={() => handleQuarterSelect(q)}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              currentQuarter === q
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Q{q}
          </button>
        ))}
        {gameHasOT && (
          <button
            onClick={() => handleQuarterSelect(5)}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              currentQuarter === 5
                ? "bg-yellow-500 text-white shadow-lg scale-105"
                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
            }`}
          >
            OT
          </button>
        )}
      </div>

      {/* Quarter Time Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{currentQuarter === 5 ? "Overtime" : `Quarter ${currentQuarter}`}</span>
          <span className="font-medium">
            {positionLabel ? (
              <span className="text-blue-600">{positionLabel}</span>
            ) : (
              formatTime(position.minutes, position.seconds)
            )}
          </span>
        </div>

        <div
          ref={quarterTrackRef}
          onPointerDown={handleQuarterPointerDown}
          onPointerMove={handleQuarterPointerMove}
          onPointerUp={handleQuarterPointerUp}
          className="relative h-6 w-full cursor-pointer select-none rounded-full bg-gray-200"
        >
          {/* Filled progress */}
          <div
            className="bg-blue-600 h-6 rounded-full transition-all duration-100"
            style={{ width: `${quarterProgress}%` }}
          />

          {/* Message markers - Own messages (blue) */}
          {quarterMarkers.own.map((marker, idx) => (
            <div
              key={`own-${idx}`}
              className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
              style={{ left: `${marker.percent}%` }}
              title={`Your message at position ${marker.position}`}
            />
          ))}

          {/* Message markers - Others' messages (gray) */}
          {quarterMarkers.others.map((marker, idx) => (
            <div
              key={`others-${idx}`}
              className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
              style={{ left: `${marker.percent}%` }}
              title={`Message at position ${marker.position}`}
            />
          ))}

          {/* Live position marker (green) */}
          {quarterLiveMarker !== null && (
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-1 bg-green-500 z-10 animate-pulse"
              style={{ left: `${quarterLiveMarker}%` }}
              title="Live position"
            />
          )}

          {/* Handle */}
          <div
            className="pointer-events-none absolute -top-1 h-8 w-8 rounded-full border-4 border-white bg-blue-600 shadow-xl z-20"
            style={{ left: `calc(${quarterProgress}% - 16px)` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>15:00</span>
          <span>0:00</span>
        </div>
      </div>
    </div>
  );
}
