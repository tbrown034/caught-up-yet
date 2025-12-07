"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrashIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import { formatShareCode } from "@/lib/share-code";
import type { GameData } from "@/lib/database.types";

interface Party {
  id: string;
  sport: string;
  share_code: string;
  created_at: string;
  game_data: GameData;
  is_active: boolean;
}

interface RoomManagerProps {
  createdParties: Party[];
}

type DeleteMode = "single" | "all" | null;

export default function RoomManager({ createdParties }: RoomManagerProps) {
  const router = useRouter();
  const [parties, setParties] = useState(createdParties);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>(null);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedParty = parties.find((p) => p.id === selectedPartyId);

  const handleDeleteSingle = async () => {
    if (!selectedPartyId) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/rooms/${selectedPartyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete room");
      }

      // Remove from local state
      setParties((prev) => prev.filter((p) => p.id !== selectedPartyId));
      setDeleteMode(null);
      setSelectedPartyId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete room");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      // Delete all rooms sequentially
      const errors: string[] = [];
      for (const party of parties) {
        const response = await fetch(`/api/rooms/${party.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json();
          errors.push(`${party.game_data?.awayTeam} @ ${party.game_data?.homeTeam}: ${data.error}`);
        }
      }

      if (errors.length > 0) {
        setError(`Some rooms couldn't be deleted:\n${errors.join("\n")}`);
      }

      // Clear local state
      setParties([]);
      setDeleteMode(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete rooms");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (mode: DeleteMode, partyId?: string) => {
    setDeleteMode(mode);
    setSelectedPartyId(partyId || null);
    setError(null);
  };

  const closeModal = () => {
    setDeleteMode(null);
    setSelectedPartyId(null);
    setError(null);
  };

  if (parties.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        You haven&apos;t created any parties yet.
      </p>
    );
  }

  return (
    <>
      {/* Header with Delete All button */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {parties.length} {parties.length === 1 ? "party" : "parties"}
        </p>
        <button
          onClick={() => openDeleteModal("all")}
          className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1"
        >
          <TrashIcon className="w-4 h-4" />
          Delete All
        </button>
      </div>

      {/* Party List */}
      <div className="space-y-3">
        {parties.map((party) => {
          const gameData = party.game_data;
          return (
            <div
              key={party.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex justify-between items-start">
                <Link href={`/rooms/${party.id}`} className="flex-1 group">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      {party.sport}
                    </span>
                    {!party.is_active && (
                      <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {gameData?.awayTeam} @ {gameData?.homeTeam}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <CalendarIcon className="w-3 h-3" />
                    {new Date(party.created_at).toLocaleDateString()}
                  </p>
                </Link>
                <div className="flex items-start gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Share Code
                    </p>
                    <p className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {formatShareCode(party.share_code)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/rooms/${party.id}`}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                      title="Open party"
                    >
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => openDeleteModal("single", party.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                      title="Delete party"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={isDeleting}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {deleteMode === "all" ? "Delete All Parties?" : "Delete Party?"}
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {deleteMode === "all" ? (
                  <>
                    This will permanently delete all{" "}
                    <strong>{parties.length}</strong> watch parties you created,
                    including all messages and member data.
                  </>
                ) : (
                  <>
                    This will permanently delete the watch party for{" "}
                    <strong>
                      {selectedParty?.game_data?.awayTeam} @{" "}
                      {selectedParty?.game_data?.homeTeam}
                    </strong>
                    , including all messages and member data.
                  </>
                )}
              </p>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6 text-left">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Warning:</strong> This action cannot be undone. All
                  members will lose access immediately.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">
                    {error}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={closeModal}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <button
                  onClick={
                    deleteMode === "all" ? handleDeleteAll : handleDeleteSingle
                  }
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4" />
                      {deleteMode === "all" ? "Delete All" : "Delete"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
