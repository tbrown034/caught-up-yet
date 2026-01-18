"use client";

import ErrorDisplay from "@/components/ui/ErrorDisplay";

/**
 * Error boundary for homepage
 * Catches errors during ESPN API data fetching for live games
 */
export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorDisplay
      title="Something Went Wrong"
      message="We couldn't load the latest games. This might be a temporary issue."
      error={error}
      reset={reset}
      suggestions={[
        "Check your internet connection",
        "Try refreshing the page",
        "Come back in a few minutes",
      ]}
      backUrl="/games"
      backLabel="Browse Games"
      devInfo="Homepage error - likely ESPN API fetch failure"
    />
  );
}
