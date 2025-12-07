"use client";

import { useEffect } from "react";
import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import Button from "./Button";

interface ErrorDisplayProps {
  /** Main title for the error */
  title?: string;
  /** User-friendly description of what went wrong */
  message?: string;
  /** The actual error object (for logging/display) */
  error?: Error & { digest?: string };
  /** Reset function from error boundary */
  reset?: () => void;
  /** Show technical details (error message, digest) */
  showTechnicalDetails?: boolean;
  /** Custom suggestions for the user */
  suggestions?: string[];
  /** Back button URL (if not home) */
  backUrl?: string;
  /** Back button label */
  backLabel?: string;
  /** Additional context for developers */
  devInfo?: string;
}

export default function ErrorDisplay({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  error,
  reset,
  showTechnicalDetails = true,
  suggestions,
  backUrl = "/",
  backLabel = "Go Home",
  devInfo,
}: ErrorDisplayProps) {
  // Log error to console for debugging
  useEffect(() => {
    if (error) {
      console.error("[ErrorDisplay]", {
        message: error.message,
        digest: error.digest,
        stack: error.stack,
        devInfo,
      });
    }
  }, [error, devInfo]);

  const handleCopyError = () => {
    const errorInfo = [
      `Error: ${error?.message || "Unknown error"}`,
      error?.digest ? `Digest: ${error.digest}` : null,
      devInfo ? `Context: ${devInfo}` : null,
      `Time: ${new Date().toISOString()}`,
      `URL: ${typeof window !== "undefined" ? window.location.href : "N/A"}`,
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(errorInfo);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-6 text-center max-w-lg">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <ExclamationTriangleIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">{message}</p>
        </div>

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 w-full text-left">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Things you can try:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {reset && (
            <Button variant="primary" onClick={reset}>
              <ArrowPathIcon className="w-4 h-4" />
              Try Again
            </Button>
          )}
          <Button variant="secondary" href={backUrl} asLink>
            {backUrl === "/" ? (
              <HomeIcon className="w-4 h-4" />
            ) : (
              <ArrowLeftIcon className="w-4 h-4" />
            )}
            {backLabel}
          </Button>
        </div>

        {/* Technical Details (collapsible for users, helpful for devs) */}
        {showTechnicalDetails && error && (
          <details className="w-full text-left mt-4">
            <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
              Technical details (for support)
            </summary>
            <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono space-y-1">
              <p className="text-gray-700 dark:text-gray-300 break-all">
                <strong>Error:</strong> {error.message || "Unknown error"}
              </p>
              {error.digest && (
                <p className="text-gray-500 dark:text-gray-400">
                  <strong>Digest:</strong> {error.digest}
                </p>
              )}
              {devInfo && (
                <p className="text-gray-500 dark:text-gray-400">
                  <strong>Context:</strong> {devInfo}
                </p>
              )}
              <button
                onClick={handleCopyError}
                className="mt-2 flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ClipboardDocumentIcon className="w-3 h-3" />
                Copy error info
              </button>
            </div>
          </details>
        )}

        {/* Contact info */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
          If this keeps happening, please contact{" "}
          <a
            href="mailto:trevorbrown.web@gmail.com"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            trevorbrown.web@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
