"use client";

import { useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  ChatBubbleLeftIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

// Sample messages at different game positions
const DEMO_MESSAGES = [
  { position: 0, quarter: 1, time: "15:00", text: "Game starting!", user: "Alex" },
  { position: 450, quarter: 1, time: "7:30", text: "Great first drive!", user: "Jordan" },
  { position: 900, quarter: 2, time: "15:00", text: "Q2 begins", user: "Alex" },
  { position: 1350, quarter: 2, time: "7:30", text: "What a catch!", user: "Sam" },
  { position: 1800, quarter: 3, time: "15:00", text: "Halftime over, let's go!", user: "Jordan" },
  { position: 2250, quarter: 3, time: "7:30", text: "Defense is stepping up", user: "Alex" },
  { position: 2700, quarter: 4, time: "15:00", text: "Final quarter!", user: "Sam" },
  { position: 3150, quarter: 4, time: "7:30", text: "This is intense!", user: "Jordan" },
  { position: 3500, quarter: 4, time: "1:40", text: "TOUCHDOWN!!!", user: "Alex" },
];

// Convert position to percentage (0-3600 for NFL)
function positionToPercent(pos: number): number {
  return Math.min(100, (pos / 3600) * 100);
}

// Format quarter label
function formatQuarter(q: number): string {
  return `Q${q}`;
}

export default function HowItWorksDemo() {
  const [userPosition, setUserPosition] = useState(1800); // Start at halftime
  const [isDragging, setIsDragging] = useState(false);

  const userPercent = positionToPercent(userPosition);
  const userQuarter = Math.min(4, Math.floor(userPosition / 900) + 1);
  const userTimeInQuarter = 900 - (userPosition % 900);
  const userMinutes = Math.floor(userTimeInQuarter / 60);
  const userSeconds = userTimeInQuarter % 60;

  const visibleMessages = DEMO_MESSAGES.filter((msg) => msg.position <= userPosition);
  const hiddenMessages = DEMO_MESSAGES.filter((msg) => msg.position > userPosition);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserPosition(parseInt(e.target.value));
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setUserPosition(Math.round(percent * 3600));
  };

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="text-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Drag the slider to simulate watching the game. Messages only appear when you reach that point.
        </p>
      </div>

      {/* Game Timeline */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Game Timeline</span>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {formatQuarter(userQuarter)} {String(userMinutes).padStart(2, "0")}:{String(userSeconds).padStart(2, "0")}
          </span>
        </div>

        {/* Timeline Track */}
        <div
          className="relative h-12 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer mb-4"
          onClick={handleTrackClick}
        >
          {/* Quarter markers */}
          <div className="absolute inset-0 flex">
            {[1, 2, 3, 4].map((q) => (
              <div
                key={q}
                className="flex-1 border-r border-gray-300 dark:border-gray-600 last:border-r-0 flex items-end justify-center pb-1"
              >
                <span className="text-xs text-gray-500 dark:text-gray-400">Q{q}</span>
              </div>
            ))}
          </div>

          {/* Message markers on timeline */}
          {DEMO_MESSAGES.map((msg, i) => {
            const isVisible = msg.position <= userPosition;
            return (
              <div
                key={i}
                className={`absolute top-2 w-2 h-2 rounded-full transform -translate-x-1 transition-all duration-200 ${
                  isVisible
                    ? "bg-green-500 scale-100"
                    : "bg-gray-400 dark:bg-gray-500 scale-75 opacity-50"
                }`}
                style={{ left: `${positionToPercent(msg.position)}%` }}
                title={isVisible ? msg.text : "Hidden message"}
              />
            );
          })}

          {/* User position marker */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500 rounded-full shadow-lg transition-all duration-100"
            style={{ left: `${userPercent}%`, transform: "translateX(-50%)" }}
          >
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 dark:bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 shadow-md" />
          </div>

          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 bottom-0 bg-blue-100 dark:bg-blue-900/30 rounded-l-lg transition-all duration-100"
            style={{ width: `${userPercent}%` }}
          />
        </div>

        {/* Slider control */}
        <input
          type="range"
          min="0"
          max="3600"
          value={userPosition}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-blue-600"
          style={{ marginTop: "-0.5rem" }}
        />
      </div>

      {/* Messages Display */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Visible Messages */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <EyeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Visible ({visibleMessages.length})
            </h4>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {visibleMessages.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No messages yet. Move forward in the game.
              </p>
            ) : (
              visibleMessages.map((msg, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800"
                >
                  <div className="w-6 h-6 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-3 h-3 text-green-700 dark:text-green-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">{msg.user}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Q{msg.quarter} {msg.time}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Hidden Messages */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <EyeSlashIcon className="w-5 h-5 text-gray-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Hidden ({hiddenMessages.length})
            </h4>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {hiddenMessages.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                You've caught up! All messages visible.
              </p>
            ) : (
              hiddenMessages.map((msg, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">???</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">Q{msg.quarter} {msg.time}</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      <div className="h-3 w-12 bg-gray-300 dark:bg-gray-600 rounded" />
                      <div className="h-3 w-8 bg-gray-300 dark:bg-gray-600 rounded" />
                      <div className="h-3 w-16 bg-gray-300 dark:bg-gray-600 rounded" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Position Encoding Explanation */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          <ChatBubbleLeftIcon className="w-5 h-5" />
          The Math Behind It
        </h4>
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
          Every moment in the game maps to a number. For NFL/CFB, each second is a position (3,600 total for a regulation game).
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Your Position</p>
            <p className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">{userPosition}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Game Progress</p>
            <p className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">{userPercent.toFixed(1)}%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Messages Visible</p>
            <p className="text-lg font-mono font-bold text-green-600 dark:text-green-400">{visibleMessages.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Still Hidden</p>
            <p className="text-lg font-mono font-bold text-gray-500 dark:text-gray-400">{hiddenMessages.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
