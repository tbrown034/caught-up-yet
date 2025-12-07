"use client";

import ErrorDisplay from "@/components/ui/ErrorDisplay";

/**
 * Error boundary for join room page
 * Catches errors during code validation, room lookup, etc.
 */
export default function JoinRoomError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isInvalidCode =
    error.message?.toLowerCase().includes("invalid") ||
    error.message?.toLowerCase().includes("code");
  const isNotFound = error.message?.toLowerCase().includes("not found");

  let title = "Join Error";
  let message = "Something went wrong while trying to join. Please try again.";
  let suggestions = [
    "Double-check the share code",
    "Make sure the code is exactly 6 characters",
    "Ask the host if the party is still active",
  ];

  if (isInvalidCode || isNotFound) {
    title = "Invalid Share Code";
    message =
      "We couldn't find a watch party with that code. It may have expired or been deleted.";
    suggestions = [
      "Check that you entered the code correctly (6 letters/numbers)",
      "Share codes expire after 24 hours",
      "Ask the host for a new share code",
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
      devInfo="Join room error - check share code validation and room lookup"
    />
  );
}
