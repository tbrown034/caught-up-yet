"use client";

import ErrorDisplay from "@/components/ui/ErrorDisplay";

/**
 * Error boundary for join by code page
 * Catches errors during room preview, code validation, etc.
 */
export default function JoinByCodeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isNotFound =
    error.message?.toLowerCase().includes("not found") ||
    error.message?.toLowerCase().includes("invalid");

  let title = "Something Went Wrong";
  let message = "We couldn't load the watch party details. Please try again.";
  let suggestions = [
    "Check your internet connection",
    "Make sure the share code is correct",
    "Try refreshing the page",
  ];

  if (isNotFound) {
    title = "Party Not Found";
    message =
      "We couldn't find a watch party with that code. It may have expired or been deleted.";
    suggestions = [
      "Check that you entered the code correctly",
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
      devInfo="Join by code error - check room preview API and code validation"
    />
  );
}
