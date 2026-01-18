"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserGroupIcon, ArrowRightEndOnRectangleIcon, ArrowRightIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";

export default function GuestBanner() {
  const router = useRouter();
  const [shareCode, setShareCode] = useState("");

  const handleJoinWithCode = () => {
    if (shareCode.trim()) {
      // Pre-fill the join page with the code
      router.push(`/rooms/join?code=${shareCode.trim()}`);
    } else {
      router.push("/rooms/join");
    }
  };

  const handleShareCodeChange = (value: string) => {
    const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setShareCode(formatted);
  };

  return (
    <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Join with Code */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <UserGroupIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Have a Share Code?</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Join a watch party as a guest - no account needed
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareCode}
              onChange={(e) => handleShareCodeChange(e.target.value)}
              placeholder="ABC123"
              maxLength={6}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-center font-mono font-bold tracking-wider uppercase focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleJoinWithCode}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1"
            >
              Join
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sign In Prompt */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRightEndOnRectangleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Want to Create Parties?</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Sign in to create your own watch parties and invite friends
          </p>
          <Button variant="primary" size="md" href="/login" asLink>
            Sign In / Sign Up
          </Button>
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400">
        <InformationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Guests</strong> can join existing parties with a share code.{" "}
          <strong>Signed-in users</strong> can create parties, track history, and
          manage their profile.
        </p>
      </div>
    </div>
  );
}
