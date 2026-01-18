"use client";

import { XMarkIcon, ShareIcon, ClockIcon, ChatBubbleLeftRightIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import ShareMenu from "./ShareMenu";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareCode: string;
  roomName: string | null;
  gameName: string;
  sport: string;
  userName: string;
}

function formatShareCode(code: string): string {
  if (!code) return "";
  return code.toUpperCase();
}

export default function WelcomeModal({
  isOpen,
  onClose,
  shareCode,
  roomName,
  gameName,
  sport,
  userName,
}: WelcomeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold mb-1">Party Created!</h2>
          <p className="text-green-100 text-sm">Invite friends to watch together</p>
        </div>

        {/* Share Code */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">
            Your share code
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold tracking-[0.3em] font-mono text-gray-900 dark:text-white">
              {formatShareCode(shareCode)}
            </p>
          </div>
          <div className="mt-4">
            <ShareMenu
              shareOptions={{
                userName,
                shareCode,
                roomName: roomName || undefined,
                gameName,
                sport,
              }}
              variant="default"
            />
          </div>
        </div>

        {/* Quick Instructions */}
        <div className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wider">
            How it works
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <ClockIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Set your position</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Drag the timeline to where you are in the game
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <ChatBubbleLeftRightIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">React and chat</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Messages are tagged with your position
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <ShieldCheckIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">No spoilers</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  You only see messages up to your current position
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Start Watching
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            You can share again from the menu anytime
          </p>
        </div>
      </div>
    </div>
  );
}
