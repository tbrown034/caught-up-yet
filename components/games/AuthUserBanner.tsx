"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserGroupIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function AuthUserBanner() {
  const router = useRouter();
  const [shareCode, setShareCode] = useState("");

  const handleJoinWithCode = () => {
    if (shareCode.trim()) {
      router.push(`/rooms/join?code=${shareCode.trim()}`);
    } else {
      router.push("/rooms/join");
    }
  };

  const handleShareCodeChange = (value: string) => {
    const formatted = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setShareCode(formatted);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleJoinWithCode();
    }
  };

  return (
    <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg p-5 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <UserGroupIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Join a Watch Party</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Have a share code? Enter it below to join an existing watch party
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareCode}
              onChange={(e) => handleShareCodeChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ABC123"
              maxLength={6}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center font-mono font-bold tracking-wider uppercase focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleJoinWithCode}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1"
            >
              Join
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Or create a new watch party by selecting a game below
          </p>
        </div>
      </div>
    </div>
  );
}
