"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserGroupIcon, ArrowRightIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";

function JoinRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [shareCode, setShareCode] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Pre-fill code from URL if provided
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      const formatted = codeFromUrl
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6);
      setShareCode(formatted);
    }
  }, [searchParams]);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user && !user.is_anonymous);
      setIsCheckingAuth(false);
    }
    checkAuth();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shareCode.trim()) {
      setError("Please enter a share code");
      return;
    }

    if (!isAuthenticated && !guestName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      // If not authenticated, sign in anonymously first
      if (!isAuthenticated) {
        const { error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) {
          throw new Error("Unable to join. Please check your internet connection and try again.");
        }
      }

      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          share_code: shareCode.trim(),
          display_name: !isAuthenticated ? guestName.trim() : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to join room");
      }

      const data = await response.json();
      router.push(`/rooms/${data.room.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to join room";
      setError(errorMessage);
      setIsJoining(false);
    }
  };

  const handleShareCodeChange = (value: string) => {
    // Auto-format as user types (uppercase, max 6 chars)
    const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setShareCode(formatted);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <UserGroupIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Join Watch Party
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter the share code to join an existing watch party
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Share Code
            </label>
            <input
              type="text"
              value={shareCode}
              onChange={(e) => handleShareCodeChange(e.target.value)}
              placeholder="ABC123"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-2xl font-bold tracking-wider bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              disabled={isJoining}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Enter the 6-character code shared with you
            </p>
          </div>

          {!isAuthenticated && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name (Guest)
              </label>
              <div className="relative">
                <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={30}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isJoining}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This name will be shown to other party members
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={!shareCode.trim() || isJoining}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isJoining ? (
                "Joining..."
              ) : (
                <>
                  Join Watch Party
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/games")}
              disabled={isJoining}
              className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg transition-colors"
            >
              Back to Games
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Don't have a code?{" "}
            <button
              onClick={() => router.push("/games")}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Create your own watch party
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function JoinRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      }
    >
      <JoinRoomContent />
    </Suspense>
  );
}
