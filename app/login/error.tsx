"use client";

import ErrorDisplay from "@/components/ui/ErrorDisplay";

/**
 * Error boundary for login page
 * Catches errors during authentication flow
 */
export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isOAuthError =
    error.message?.toLowerCase().includes("oauth") ||
    error.message?.toLowerCase().includes("provider");
  const isNetworkError =
    error.message?.toLowerCase().includes("network") ||
    error.message?.toLowerCase().includes("fetch");

  let title = "Sign In Error";
  let message = "Something went wrong during sign in. Please try again.";
  let suggestions = [
    "Try signing in again",
    "Use a different sign-in method",
    "Clear your browser cookies and try again",
  ];

  if (isOAuthError) {
    title = "Authentication Failed";
    message =
      "We couldn't complete the sign-in with your provider. This might be a temporary issue.";
    suggestions = [
      "Try signing in again",
      "Check if pop-ups are blocked in your browser",
      "Try a different browser or device",
    ];
  } else if (isNetworkError) {
    title = "Connection Problem";
    message = "We couldn't connect to our authentication service.";
    suggestions = [
      "Check your internet connection",
      "Try again in a few moments",
      "Disable VPN if you're using one",
    ];
  }

  return (
    <ErrorDisplay
      title={title}
      message={message}
      error={error}
      reset={reset}
      suggestions={suggestions}
      devInfo="Login error - check OAuth configuration and Supabase auth settings"
    />
  );
}
