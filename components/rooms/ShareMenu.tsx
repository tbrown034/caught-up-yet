"use client";

import { useState } from "react";
import { Share2, Copy, Mail, MessageSquare, Check } from "lucide-react";
import {
  generateShareMessage,
  generateEmailShare,
  generateSMSShare,
  copyToClipboard,
  type ShareOptions,
} from "@/lib/share-utils";
import { formatShareCode } from "@/lib/share-code";

interface ShareMenuProps {
  shareOptions: ShareOptions;
  variant?: "default" | "success";
}

export default function ShareMenu({
  shareOptions,
  variant = "default",
}: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopyCode = async () => {
    await copyToClipboard(shareOptions.shareCode);
    setCopiedItem("code");
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleCopyMessage = async () => {
    const message = generateShareMessage(shareOptions);
    await copyToClipboard(message);
    setCopiedItem("message");
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleEmail = () => {
    const emailUrl = generateEmailShare(shareOptions);
    window.location.href = emailUrl;
    setIsOpen(false);
  };

  const handleSMS = () => {
    const smsUrl = generateSMSShare(shareOptions);
    window.location.href = smsUrl;
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          variant === "success"
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        <Share2 className="w-4 h-4" />
        Share Party
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">
                Share Watch Party
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                Invite friends to join
              </p>
            </div>

            {/* Share Code Display */}
            <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
              <p className="text-xs text-gray-600 mb-1">Share Code</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-blue-600 tracking-wider">
                  {formatShareCode(shareOptions.shareCode)}
                </p>
                <button
                  onClick={handleCopyCode}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Copy code"
                >
                  {copiedItem === "code" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Share Options */}
            <div className="py-2">
              <button
                onClick={handleCopyMessage}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                {copiedItem === "message" ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Copy Invitation
                  </p>
                  <p className="text-xs text-gray-500">
                    Copy full message with link
                  </p>
                </div>
              </button>

              <button
                onClick={handleEmail}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <Mail className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Send via Email
                  </p>
                  <p className="text-xs text-gray-500">
                    Opens your email app
                  </p>
                </div>
              </button>

              <button
                onClick={handleSMS}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Send via Text
                  </p>
                  <p className="text-xs text-gray-500">
                    Opens your messaging app
                  </p>
                </div>
              </button>
            </div>

            {/* Preview */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Preview Message:
              </p>
              <div className="text-xs text-gray-600 bg-white rounded p-2 border border-gray-200 max-h-32 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans">
                  {generateShareMessage(shareOptions)}
                </pre>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
