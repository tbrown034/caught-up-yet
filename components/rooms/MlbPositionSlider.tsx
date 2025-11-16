"use client";

import { useState } from "react";
import type { MlbPosition } from "@/lib/database.types";
import { formatMlbPosition } from "@/lib/game-position";

interface MlbPositionSliderProps {
  position: MlbPosition;
  onChange: (position: MlbPosition) => void;
}

export default function MlbPositionSlider({
  position,
  onChange,
}: MlbPositionSliderProps) {
  const [inning, setInning] = useState(position.inning);
  const [half, setHalf] = useState<"TOP" | "BOTTOM">(position.half);
  const [outs, setOuts] = useState<0 | 1 | 2>(position.outs ?? 0);

  const handleInningChange = (newInning: number) => {
    setInning(newInning);
    onChange({ inning: newInning, half, outs });
  };

  const handleHalfChange = (newHalf: "TOP" | "BOTTOM") => {
    setHalf(newHalf);
    onChange({ inning, half: newHalf, outs });
  };

  const handleOutsChange = (newOuts: 0 | 1 | 2) => {
    setOuts(newOuts);
    onChange({ inning, half, outs: newOuts });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Where are you in the game?
      </h3>

      <div className="text-center mb-6">
        <p className="text-3xl font-bold text-blue-600">
          {formatMlbPosition({ inning, half, outs })}
        </p>
        <p className="text-sm text-gray-500 mt-1">Your current position</p>
      </div>

      {/* Inning Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Inning: {inning}
        </label>
        <input
          type="range"
          min="1"
          max="15"
          value={inning}
          onChange={(e) => handleInningChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1st</span>
          <span>9th</span>
          <span>15th+</span>
        </div>
      </div>

      {/* Half Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Half
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["TOP", "BOTTOM"] as const).map((h) => (
            <button
              key={h}
              onClick={() => handleHalfChange(h)}
              className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                half === h
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {h === "TOP" ? "Top" : "Bottom"}
            </button>
          ))}
        </div>
      </div>

      {/* Outs Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Outs
        </label>
        <div className="grid grid-cols-3 gap-2">
          {([0, 1, 2] as const).map((o) => (
            <button
              key={o}
              onClick={() => handleOutsChange(o)}
              className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                outs === o
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-900">
          <strong>Tip:</strong> Update your position as you watch the game. This
          helps prevent spoilers from messages posted ahead of where you are!
        </p>
      </div>
    </div>
  );
}
