"use client";

import { useCallback, useMemo, useRef } from "react";
import { Circle } from "lucide-react";
import type { GameData } from "@/lib/database.types";
import {
  decodeMlbPosition,
  encodeMlbPosition,
  positionToPercentage,
  percentageToPosition,
} from "@/lib/position-encoding";
import { getScoreAtPosition } from "@/lib/score-calculator";

interface MlbBoxScoreProps {
  positionEncoded: number;
  onChange: (newPositionEncoded: number) => void;
  gameData: GameData;
  messagePositions?: number[];
  livePositionEncoded?: number | null;
}

export default function MlbBoxScore({
  positionEncoded,
  onChange,
  gameData,
  messagePositions = [],
  livePositionEncoded = null,
}: MlbBoxScoreProps) {
  const fullGameTrackRef = useRef<HTMLDivElement>(null);
  const fullGamePointerIdRef = useRef<number | null>(null);

  const position = useMemo(
    () => decodeMlbPosition(positionEncoded),
    [positionEncoded]
  );

  const currentInning = position.inning;
  const currentHalf = position.half;
  const currentOuts = position.outs ?? 0;

  // Full game progress (0-100%)
  const fullGameProgress = positionToPercentage(positionEncoded, "mlb");

  // Calculate current score based on position using scoring plays
  const currentScore = useMemo(() => {
    return getScoreAtPosition(gameData.scoringPlays, positionEncoded, "mlb");
  }, [gameData.scoringPlays, positionEncoded]);

  // Get message markers for full game slider
  const fullGameMarkers = useMemo(() => {
    return messagePositions.map((pos) => ({
      position: pos,
      percent: positionToPercentage(pos, "mlb"),
    }));
  }, [messagePositions]);

  // Live position marker
  const fullGameLiveMarker = useMemo(() => {
    if (livePositionEncoded === null) return null;
    return positionToPercentage(livePositionEncoded, "mlb");
  }, [livePositionEncoded]);

  // Calculate which innings have messages
  const inningsWithMessages = useMemo(() => {
    const innings = new Set<number>();
    messagePositions.forEach((pos) => {
      const inning = Math.floor(pos / 8) + 1;
      innings.add(inning);
    });
    return innings;
  }, [messagePositions]);

  // Full game slider change
  const handleFullGameSliderChange = useCallback(
    (percent: number) => {
      const newPosition = percentageToPosition(percent, "mlb");
      onChange(newPosition);
    },
    [onChange]
  );

  const updateFromClientX = useCallback(
    (clientX: number) => {
      if (!fullGameTrackRef.current) return;
      const rect = fullGameTrackRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = (clientX - rect.left) / rect.width;
      handleFullGameSliderChange(ratio * 100);
    },
    [handleFullGameSliderChange]
  );

  const handleFullGamePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      fullGamePointerIdRef.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
      updateFromClientX(event.clientX);
    },
    [updateFromClientX]
  );

  const handleFullGamePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (fullGamePointerIdRef.current !== event.pointerId) return;
      updateFromClientX(event.clientX);
    },
    [updateFromClientX]
  );

  const handleFullGamePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (fullGamePointerIdRef.current !== event.pointerId) return;
      fullGamePointerIdRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    },
    []
  );

  const handleInningSelect = useCallback(
    (inning: number) => {
      // Jump to start of selected inning (Top, 0 outs)
      const newPosition = encodeMlbPosition({
        inning,
        half: "TOP",
        outs: 0,
      });
      onChange(newPosition);
    },
    [onChange]
  );

  const handleHalfSelect = useCallback(
    (half: "TOP" | "BOTTOM") => {
      const newPosition = encodeMlbPosition({
        inning: currentInning,
        half,
        outs: 0,
      });
      onChange(newPosition);
    },
    [currentInning, onChange]
  );

  const handleOutsSelect = useCallback(
    (outs: 0 | 1 | 2) => {
      const newPosition = encodeMlbPosition({
        inning: currentInning,
        half: currentHalf,
        outs,
      });
      onChange(newPosition);
    },
    [currentInning, currentHalf, onChange]
  );

  const getOrdinal = (n: number): string => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="space-y-4">
      {/* Traditional Baseball Box Score */}
      <div className="bg-green-900 text-white rounded-lg p-4 overflow-x-auto">
        <div className="min-w-max">
          {/* Inning headers */}
          <div className="grid grid-cols-12 gap-1 text-center mb-2">
            <div className="col-span-2" />
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((inning) => (
              <div
                key={inning}
                className={`text-xs font-medium ${
                  inning === currentInning
                    ? "text-yellow-300"
                    : "text-green-300"
                }`}
              >
                {inning}
              </div>
            ))}
            <div className="text-xs font-medium text-green-300">R</div>
          </div>

          {/* Away team */}
          <div className="grid grid-cols-12 gap-1 text-center">
            <div className="col-span-2 text-left text-sm font-semibold truncate">
              {gameData.awayTeam}
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((inning) => {
              // Away team completes an inning when we're in bottom of that inning or past it
              const inningCompleted = inning < currentInning || (inning === currentInning && currentHalf === "BOTTOM");
              const hasScore = gameData.awayLinescores && gameData.awayLinescores[inning - 1] !== undefined;
              return (
                <div
                  key={inning}
                  className={`text-sm ${
                    inningCompleted ? "text-white" : "text-green-700"
                  }`}
                >
                  {inningCompleted && hasScore ? gameData.awayLinescores![inning - 1] : inningCompleted ? "-" : ""}
                </div>
              );
            })}
            <div className="text-sm font-semibold text-yellow-400">
              {currentScore.away}
            </div>
          </div>

          {/* Home team */}
          <div className="grid grid-cols-12 gap-1 text-center mt-1">
            <div className="col-span-2 text-left text-sm font-semibold truncate">
              {gameData.homeTeam}
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((inning) => {
              // Home team completes an inning when we're past that inning entirely
              const inningCompleted = inning < currentInning;
              const hasScore = gameData.homeLinescores && gameData.homeLinescores[inning - 1] !== undefined;
              return (
                <div
                  key={inning}
                  className={`text-sm ${
                    inningCompleted ? "text-white" : "text-green-700"
                  }`}
                >
                  {inningCompleted && hasScore ? gameData.homeLinescores![inning - 1] : inningCompleted ? "-" : ""}
                </div>
              );
            })}
            <div className="text-sm font-semibold text-yellow-400">
              {currentScore.home}
            </div>
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
          {/* Inning dividers (8 dividers for 9 innings) */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-gray-400 z-5"
              style={{ left: `${(i / 9) * 100}%` }}
            />
          ))}

          {/* Filled progress */}
          <div
            className="bg-green-600 h-4 rounded-full transition-all duration-100"
            style={{ width: `${fullGameProgress}%` }}
          />

          {/* Message markers */}
          {fullGameMarkers.map((marker, idx) => (
            <div
              key={idx}
              className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10"
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
            className="pointer-events-none absolute -top-1 h-6 w-6 rounded-full border-3 border-white bg-green-600 shadow-lg z-20"
            style={{ left: `calc(${fullGameProgress}% - 12px)` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>1st</span>
          <span>5th</span>
          <span>9th</span>
        </div>
      </div>

      {/* Inning Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Inning
        </label>
        <div className="grid grid-cols-9 gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((inning) => (
            <button
              key={inning}
              onClick={() => handleInningSelect(inning)}
              className={`relative py-3 rounded-lg font-semibold transition-all ${
                currentInning === inning
                  ? "bg-green-600 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {inning}
              {inningsWithMessages.has(inning) && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Half Inning Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {getOrdinal(currentInning)} Inning
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleHalfSelect("TOP")}
            className={`py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              currentHalf === "TOP"
                ? "bg-green-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="text-xs">▲</span>
            Top
          </button>
          <button
            onClick={() => handleHalfSelect("BOTTOM")}
            className={`py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              currentHalf === "BOTTOM"
                ? "bg-green-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="text-xs">▼</span>
            Bottom
          </button>
        </div>
      </div>

      {/* Outs Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Outs
        </label>
        <div className="flex items-center justify-center gap-4 bg-gray-50 rounded-lg p-4">
          {([0, 1, 2] as const).map((outs) => (
            <button
              key={outs}
              onClick={() => handleOutsSelect(outs)}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                currentOuts === outs
                  ? "bg-green-600 text-white shadow-lg scale-110"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((outNum) => (
                  <Circle
                    key={outNum}
                    className={`w-4 h-4 ${
                      outNum < outs
                        ? currentOuts === outs
                          ? "fill-white text-white"
                          : "fill-green-600 text-green-600"
                        : currentOuts === outs
                        ? "text-white"
                        : "text-gray-400"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium">
                {outs} {outs === 1 ? "out" : "outs"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Position Display */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <div className="text-lg font-bold text-green-800">
          {currentHalf === "TOP" ? "Top" : "Bottom"} {getOrdinal(currentInning)}
        </div>
        <div className="text-sm text-green-700">
          {currentOuts} {currentOuts === 1 ? "out" : "outs"}
        </div>
      </div>
    </div>
  );
}
