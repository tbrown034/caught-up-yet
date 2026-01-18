"use client";

import { Fragment } from "react";
import {
  XMarkIcon,
  UserGroupIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
  ShieldCheckIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import type { GameData, RoomMember } from "@/lib/database.types";
import ShareMenu from "./ShareMenu";
import BoxScorePosition, { type MessageMarkers } from "./BoxScorePosition";

interface RoomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // Room data
  roomName: string | null;
  shareCode: string;
  sport: "nfl" | "mlb" | "nba" | "nhl";
  gameData: GameData;
  creatorId: string;
  // User data
  userId: string;
  userName: string;
  // Members
  members: RoomMember[];
  // Position controls
  positionEncoded: number;
  onPositionChange: (newPosition: number) => void;
  livePositionEncoded: number | null;
  onGoLive: () => void;
  messagePositions: number[];
  messageMarkers?: MessageMarkers;
  // Spoiler protection
  showSpoilers: boolean;
  onToggleSpoilers: () => void;
  hiddenMessagesCount: number;
  // Game status
  gameStatus: string | null;
  // Delete
  onDeleteRoom: () => void;
}

export default function RoomDrawer({
  isOpen,
  onClose,
  roomName,
  shareCode,
  sport,
  gameData,
  creatorId,
  userId,
  userName,
  members,
  positionEncoded,
  onPositionChange,
  livePositionEncoded,
  onGoLive,
  messagePositions,
  messageMarkers,
  showSpoilers,
  onToggleSpoilers,
  hiddenMessagesCount,
  gameStatus,
  onDeleteRoom,
}: RoomDrawerProps) {
  const [expandedSections, setExpandedSections] = useState({
    game: true,
    progress: true,
    safety: false,
    party: false,
  });

  const isCreator = userId === creatorId;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isLive =
    gameStatus === "STATUS_IN_PROGRESS" ||
    gameStatus === "IN_PROGRESS" ||
    gameStatus === "LIVE";
  const isFinal =
    gameStatus === "STATUS_FINAL" ||
    gameStatus === "POST" ||
    gameStatus === "FINAL";

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Party Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          {/* Game Section */}
          <div className="border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => toggleSection("game")}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Game
              </span>
              {expandedSections.game ? (
                <ChevronUpIcon className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.game && (
              <div className="px-4 pb-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {gameData?.awayTeam}
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {gameData?.awayScore || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {gameData?.homeTeam}
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {gameData?.homeScore || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLive && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                        <SignalIcon className="w-3 h-3" />
                        LIVE
                      </span>
                    )}
                    {isFinal && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        FINAL
                      </span>
                    )}
                    {!isLive && !isFinal && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        {sport.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Your Progress Section */}
          <div className="border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => toggleSection("progress")}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Your Progress
              </span>
              {expandedSections.progress ? (
                <ChevronUpIcon className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.progress && (
              <div className="px-4 pb-4">
                <BoxScorePosition
                  sport={sport}
                  positionEncoded={positionEncoded}
                  onChange={onPositionChange}
                  gameData={gameData}
                  messagePositions={messagePositions}
                  messageMarkers={messageMarkers}
                  livePositionEncoded={livePositionEncoded}
                  onGoLive={onGoLive}
                />
              </div>
            )}
          </div>

          {/* Safety Section */}
          <div className="border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => toggleSection("safety")}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Safety
              </span>
              {expandedSections.safety ? (
                <ChevronUpIcon className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.safety && (
              <div className="px-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        Spoiler Protection
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {showSpoilers
                          ? "All markers visible"
                          : "Future markers hidden"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onToggleSpoilers}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showSpoilers
                        ? "bg-gray-300 dark:bg-gray-600"
                        : "bg-blue-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showSpoilers ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                {!showSpoilers && hiddenMessagesCount > 0 && (
                  <p className="mt-2 text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    {hiddenMessagesCount}{" "}
                    {hiddenMessagesCount === 1 ? "message" : "messages"} ahead
                    (hidden)
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Party Section */}
          <div className="border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => toggleSection("party")}
              className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Party ({members.length})
              </span>
              {expandedSections.party ? (
                <ChevronUpIcon className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expandedSections.party && (
              <div className="px-4 pb-4 space-y-3">
                {/* Members list */}
                <div className="space-y-2">
                  {members.map((member) => {
                    const memberIsCreator = member.user_id === creatorId;
                    const isCurrentUser = member.user_id === userId;
                    const displayName = member.display_name || "Member";

                    return (
                      <div
                        key={member.user_id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                          isCurrentUser
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : "bg-gray-50 dark:bg-gray-800"
                        }`}
                      >
                        {memberIsCreator && (
                          <StarIcon className="w-4 h-4 text-yellow-500" />
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {displayName}
                          {isCurrentUser && (
                            <span className="text-gray-500 dark:text-gray-400">
                              {" "}
                              (you)
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Share button */}
                <ShareMenu
                  shareOptions={{
                    userName,
                    shareCode,
                    roomName: roomName || undefined,
                    gameName: `${gameData?.awayTeam} @ ${gameData?.homeTeam}`,
                    sport,
                  }}
                  variant="default"
                />
              </div>
            )}
          </div>

          {/* Danger Zone - Creator only */}
          {isCreator && (
            <div className="p-4">
              <button
                onClick={onDeleteRoom}
                className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
              >
                <TrashIcon className="w-4 h-4" />
                Delete Watch Party
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
