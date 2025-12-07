"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { Room, GameData } from "@/lib/database.types";
import { formatShareCode } from "@/lib/share-code";

interface RoomCardProps {
  room: Room;
  isCreator: boolean;
}

export default function RoomCard({ room, isCreator }: RoomCardProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const gameData = room.game_data as GameData;
  const isExpired = new Date(room.expires_at) < new Date();

  const handleDeleteRoom = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete room");
      }

      // Refresh the page to show updated list
      router.refresh();
    } catch (err) {
      console.error("Error deleting room:", err);
      alert("Failed to delete room. Please try again.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Link
        href={isExpired ? "#" : `/rooms/${room.id}`}
        className={`block border rounded-lg p-4 transition-colors relative ${
          isExpired
            ? "bg-gray-50 border-gray-200 cursor-not-allowed"
            : "bg-white border-gray-300 hover:border-blue-500"
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase">
                {room.sport}
              </span>
              {isExpired && (
                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-semibold rounded">
                  EXPIRED
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900">
              {room.name || `${gameData?.awayTeam} @ ${gameData?.homeTeam}`}
            </h3>
            {room.name && (
              <p className="text-xs text-gray-600 mt-0.5">
                {gameData?.awayTeam} @ {gameData?.homeTeam}
              </p>
            )}
            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
              <CalendarIcon className="w-3 h-3" />
              {new Date(room.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Share Code</p>
            <p className="font-mono font-semibold text-blue-600">
              {formatShareCode(room.share_code)}
            </p>
          </div>
        </div>

        {/* Delete button for creator */}
        {isCreator && !isExpired && (
          <div className="absolute top-4 right-4">
            <button
              onClick={handleDeleteClick}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete party"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </Link>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrashIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Watch Party?
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              This will permanently delete &quot;
              {room.name || `${gameData?.awayTeam} @ ${gameData?.homeTeam}`}
              &quot; and all associated messages. All members will lose access.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteRoom}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete Party"}
              </button>
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 disabled:border-gray-200 disabled:text-gray-400 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
