"use client";

import ErrorDisplay from "@/components/ui/ErrorDisplay";

/**
 * Error boundary for games page
 * Catches errors during ESPN API calls, game data parsing, etc.
 */
export default function GamesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isApiError =
    error.message?.toLowerCase().includes("api") ||
    error.message?.toLowerCase().includes("espn");
  const isNetworkError =
    error.message?.toLowerCase().includes("network") ||
    error.message?.toLowerCase().includes("fetch") ||
    error.message?.toLowerCase().includes("timeout");

  let title = "Failed to Load Games";
  let message =
    "We couldn't fetch the latest game data. Please try again in a moment.";
  let suggestions = [
    "Try refreshing the page",
    "Check your internet connection",
    "The ESPN API may be temporarily unavailable",
  ];

  if (isApiError) {
    title = "ESPN Data Unavailable";
    message =
      "We're having trouble getting game data from ESPN. This usually resolves itself quickly.";
    suggestions = [
      "Wait a few moments and refresh",
      "Try a different sport tab",
      "ESPN's API occasionally has brief outages",
    ];
  } else if (isNetworkError) {
    title = "Connection Problem";
    message = "We couldn't connect to fetch game data.";
    suggestions = [
      "Check your internet connection",
      "Try disabling your VPN if using one",
      "Refresh the page in a few moments",
    ];
  }

  return (
    <ErrorDisplay
      title={title}
      message={message}
      error={error}
      reset={reset}
      suggestions={suggestions}
      devInfo="Games page error - ESPN API may be down or rate limited. Check network tab for response codes."
    />
  );
}
