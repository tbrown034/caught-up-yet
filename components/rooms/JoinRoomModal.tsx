"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Users, ArrowRight } from "lucide-react";

interface JoinRoomModalProps {
  onClose: () => void;
}

export default function JoinRoomModal({ onClose }: JoinRoomModalProps) {
  const router = useRouter();
  const [shareCode, setShareCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shareCode.trim()) {
      setError("Please enter a share code");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          share_code: shareCode.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to join room");
      }

      const data = await response.json();
      router.push(`/rooms/${data.room.id}`);
    } catch (err) {
      console.error("Error joining room:", err);
      setError(err instanceof Error ? err.message : "Failed to join room");
      setIsJoining(false);
    }
  };

  const handleShareCodeChange = (value: string) => {
    // Auto-format as user types (uppercase, max 6 chars)
    const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setShareCode(formatted);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Join Watch Party
          </h2>
          <p className="text-sm text-gray-600">
            Enter the share code to join an existing watch party
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Code
            </label>
            <input
              type="text"
              value={shareCode}
              onChange={(e) => handleShareCodeChange(e.target.value)}
              placeholder="ABC123"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              disabled={isJoining}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Enter the 6-character code shared with you
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={!shareCode.trim() || isJoining}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isJoining ? (
                "Joining..."
              ) : (
                <>
                  Join Watch Party
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isJoining}
              className="w-full border-2 border-gray-300 hover:border-gray-400 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 font-semibold py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Don't have a code? Create your own watch party for any game
          </p>
        </div>
      </div>
    </div>
  );
}
