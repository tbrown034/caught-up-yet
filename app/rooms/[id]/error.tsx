"use client";

import ErrorDisplay from "@/components/ui/ErrorDisplay";

/**
 * Error boundary for watch party room page
 * Catches errors during room loading, real-time subscriptions, etc.
 */
export default function RoomError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Determine specific error type for better messaging
  const isNotFound =
    error.message?.toLowerCase().includes("not found") ||
    error.message?.toLowerCase().includes("does not exist");
  const isExpired = error.message?.toLowerCase().includes("expired");
  const isAuthError =
    error.message?.toLowerCase().includes("unauthorized") ||
    error.message?.toLowerCase().includes("permission");
  const isConnectionError =
    error.message?.toLowerCase().includes("network") ||
    error.message?.toLowerCase().includes("connection") ||
    error.message?.toLowerCase().includes("fetch");

  let title = "Watch Party Error";
  let message =
    "Something went wrong while loading this watch party. Please try again.";
  let suggestions = [
    "Check if the share code is correct",
    "Make sure you have a stable internet connection",
    "Try refreshing the page",
  ];

  if (isNotFound) {
    title = "Watch Party Not Found";
    message =
      "This watch party doesn't exist or may have been deleted by the host.";
    suggestions = [
      "Double-check the share code you received",
      "Ask the host if the party is still active",
      "Create a new watch party from the Games page",
    ];
  } else if (isExpired) {
    title = "Watch Party Expired";
    message =
      "This watch party has expired. Watch parties are available for 24 hours after creation.";
    suggestions = [
      "Ask the host to create a new watch party",
      "Create your own watch party from the Games page",
    ];
  } else if (isAuthError) {
    title = "Access Denied";
    message =
      "You don't have permission to view this watch party. You may need to join with a share code.";
    suggestions = [
      "Make sure you're signed in to the correct account",
      "Ask the host for the share code",
      'Use the "Join Party" page to enter with a code',
    ];
  } else if (isConnectionError) {
    title = "Connection Problem";
    message =
      "We couldn't connect to the watch party. This might be a temporary network issue.";
    suggestions = [
      "Check your internet connection",
      "Try refreshing the page",
      "Wait a moment and try again",
    ];
  }

  return (
    <ErrorDisplay
      title={title}
      message={message}
      error={error}
      reset={reset}
      suggestions={suggestions}
      backUrl="/games"
      backLabel="Browse Games"
      devInfo="Room page error - check room ID, permissions, and realtime connection"
    />
  );
}
