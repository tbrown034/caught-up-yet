"use client";

import ErrorDisplay from "@/components/ui/ErrorDisplay";

/**
 * Error boundary for dashboard page
 * Catches errors during room list loading, user data fetching, etc.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isAuthError =
    error.message?.toLowerCase().includes("unauthorized") ||
    error.message?.toLowerCase().includes("not authenticated");
  const isDbError =
    error.message?.toLowerCase().includes("database") ||
    error.message?.toLowerCase().includes("supabase");

  let title = "Dashboard Error";
  let message =
    "We couldn't load your dashboard. Please try again in a moment.";
  let suggestions = [
    "Try refreshing the page",
    "Check your internet connection",
    "Sign out and sign back in",
  ];

  if (isAuthError) {
    title = "Session Expired";
    message =
      "Your session may have expired. Please sign in again to view your dashboard.";
    suggestions = [
      "Sign in again using the button below",
      "Clear your browser cookies if the problem persists",
    ];
  } else if (isDbError) {
    title = "Service Temporarily Unavailable";
    message =
      "We're having trouble connecting to our servers. This is usually temporary.";
    suggestions = [
      "Wait a few moments and try again",
      "Check status.supabase.com for any outages",
    ];
  }

  return (
    <ErrorDisplay
      title={title}
      message={message}
      error={error}
      reset={reset}
      suggestions={suggestions}
      backUrl={isAuthError ? "/login" : "/"}
      backLabel={isAuthError ? "Sign In" : "Go Home"}
      devInfo="Dashboard error - check auth state and Supabase connection"
    />
  );
}
