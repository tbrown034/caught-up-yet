"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

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
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 text-sm">
      <span className="text-gray-500 dark:text-gray-400">Have a code?</span>
      <input
        type="text"
        value={shareCode}
        onChange={(e) => handleShareCodeChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="ABC123"
        maxLength={6}
        className="w-20 px-2 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded text-center font-mono font-semibold tracking-wider uppercase text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        onClick={handleJoinWithCode}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
      >
        Join
        <ArrowRightIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
