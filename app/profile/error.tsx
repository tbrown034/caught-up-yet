"use client";

import ErrorDisplay from "@/components/ui/ErrorDisplay";

/**
 * Error boundary for profile page
 * Catches errors during profile loading, updates, etc.
 */
export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isAuthError =
    error.message?.toLowerCase().includes("unauthorized") ||
    error.message?.toLowerCase().includes("not authenticated");

  let title = "Profile Error";
  let message =
    "We couldn't load your profile. Please try again in a moment.";
  let suggestions = [
    "Try refreshing the page",
    "Sign out and sign back in",
    "Check your internet connection",
  ];

  if (isAuthError) {
    title = "Not Signed In";
    message = "You need to be signed in to view your profile.";
    suggestions = [
      "Sign in to access your profile",
      "Create an account if you don't have one",
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
      devInfo="Profile error - check auth state and user data fetching"
    />
  );
}
