"use client";

import ErrorDisplay from "@/components/ui/ErrorDisplay";

/**
 * Error boundary for admin page
 * Catches errors during admin data fetching, user management, etc.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isUnauthorized =
    error.message?.toLowerCase().includes("unauthorized") ||
    error.message?.toLowerCase().includes("forbidden");

  let title = "Admin Error";
  let message = "Something went wrong while loading admin data. Please try again.";
  let suggestions = [
    "Refresh the page",
    "Check your admin permissions",
    "Contact support if the issue persists",
  ];

  if (isUnauthorized) {
    title = "Access Denied";
    message = "You don't have permission to access the admin panel.";
    suggestions = [
      "Make sure you're logged in with an admin account",
      "Contact the site owner if you need access",
    ];
  }

  return (
    <ErrorDisplay
      title={title}
      message={message}
      error={error}
      reset={reset}
      suggestions={suggestions}
      backUrl="/dashboard"
      backLabel="Back to Dashboard"
      devInfo="Admin error - check authentication and admin role validation"
    />
  );
}
