"use client";

import { useState } from "react";
import { ESPNGame } from "@/lib/espn-api";
import Image from "next/image";
import { Users } from "lucide-react";
import CreateRoomModal from "@/components/rooms/CreateRoomModal";

interface GameCardProps {
  game: ESPNGame;
}

export default function GameCard({ game }: GameCardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const awayTeam = game.competitors[0];
  const homeTeam = game.competitors[1];
  const isLive = game.status.type === "STATUS_IN_PROGRESS";
  const isFinal = game.status.type === "STATUS_FINAL";

  const gameTime = new Date(game.date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-lg transition-shadow">
        {/* Status Badge */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold text-gray-500 uppercase">
            {game.sport.toUpperCase()}
          </span>
          {isLive && (
            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded">
              LIVE
            </span>
          )}
          {isFinal && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
              FINAL
            </span>
          )}
          {!isLive && !isFinal && (
            <span className="text-xs text-gray-500">{gameTime}</span>
          )}
        </div>

        {/* Teams */}
        <div className="space-y-4">
          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Image
                src={awayTeam.team.logo}
                alt={awayTeam.team.displayName}
                width={48}
                height={48}
                className="object-contain"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  {awayTeam.team.displayName}
                </p>
                <p className="text-sm text-gray-500">
                  {awayTeam.team.abbreviation}
                </p>
              </div>
            </div>
            {awayTeam.score && (
              <span className="text-2xl font-bold text-gray-900">
                {awayTeam.score}
              </span>
            )}
          </div>

          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Image
                src={homeTeam.team.logo}
                alt={homeTeam.team.displayName}
                width={48}
                height={48}
                className="object-contain"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  {homeTeam.team.displayName}
                </p>
                <p className="text-sm text-gray-500">
                  {homeTeam.team.abbreviation}
                </p>
              </div>
            </div>
            {homeTeam.score && (
              <span className="text-2xl font-bold text-gray-900">
                {homeTeam.score}
              </span>
            )}
          </div>
        </div>

        {/* Game Status Detail */}
        {isLive && game.status.displayClock && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">{game.status.detail}</p>
          </div>
        )}

        {/* Create Watch Party Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Create Watch Party
          </button>
        </div>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <CreateRoomModal
          game={game}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}
