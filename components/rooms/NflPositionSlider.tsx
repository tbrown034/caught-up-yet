"use client";

import { useState } from "react";
import type { NflPosition } from "@/lib/database.types";
import { formatNflPosition } from "@/lib/game-position";

interface NflPositionSliderProps {
  position: NflPosition;
  onChange: (position: NflPosition) => void;
}

export default function NflPositionSlider({
  position,
  onChange,
}: NflPositionSliderProps) {
  const [quarter, setQuarter] = useState<1 | 2 | 3 | 4>(position.quarter);
  const [minutes, setMinutes] = useState(position.minutes);
  const [seconds, setSeconds] = useState(position.seconds);

  const handleQuarterChange = (newQuarter: 1 | 2 | 3 | 4) => {
    setQuarter(newQuarter);
    onChange({ quarter: newQuarter, minutes, seconds });
  };

  const handleMinutesChange = (newMinutes: number) => {
    setMinutes(newMinutes);
    onChange({ quarter, minutes: newMinutes, seconds });
  };

  const handleSecondsChange = (newSeconds: number) => {
    setSeconds(newSeconds);
    onChange({ quarter, minutes, seconds: newSeconds });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Where are you in the game?
      </h3>

      <div className="text-center mb-6">
        <p className="text-3xl font-bold text-blue-600">
          {formatNflPosition({ quarter, minutes, seconds })}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Your current position
        </p>
      </div>

      {/* Quarter Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quarter
        </label>
        <div className="grid grid-cols-4 gap-2">
          {([1, 2, 3, 4] as const).map((q) => (
            <button
              key={q}
              onClick={() => handleQuarterChange(q)}
              className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                quarter === q
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Q{q}
            </button>
          ))}
        </div>
      </div>

      {/* Time Selector */}
      <div className="space-y-4">
        {/* Minutes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minutes: {minutes}
          </label>
          <input
            type="range"
            min="0"
            max="15"
            value={minutes}
            onChange={(e) => handleMinutesChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0:00</span>
            <span>15:00</span>
          </div>
        </div>

        {/* Seconds */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seconds: {seconds}
          </label>
          <input
            type="range"
            min="0"
            max="59"
            value={seconds}
            onChange={(e) => handleSecondsChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>:00</span>
            <span>:59</span>
          </div>
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
