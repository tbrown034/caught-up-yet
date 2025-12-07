"use client";

import { useEffect } from "react";
import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

/**
 * Global error boundary - catches errors in root layout
 * Must define its own <html> and <body> since it replaces root layout
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error("[GlobalError]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="flex flex-col items-center gap-6 text-center max-w-lg">
            {/* Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
            </div>

            {/* Title & Message */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Something went wrong
              </h1>
              <p className="text-gray-600 text-lg">
                A critical error occurred. We apologize for the inconvenience.
              </p>
            </div>

            {/* Suggestions */}
            <div className="bg-white rounded-lg p-4 w-full text-left border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Things you can try:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  Click &quot;Try Again&quot; to reload the page
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  Clear your browser cache and cookies
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  Try again in a few minutes
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Try Again
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                <HomeIcon className="w-4 h-4" />
                Go Home
              </a>
            </div>

            {/* Technical Details */}
            {error.digest && (
              <p className="text-xs text-gray-400 mt-4">
                Error ID: {error.digest}
              </p>
            )}

            {/* Contact info */}
            <p className="text-xs text-gray-400">
              If this keeps happening, please contact{" "}
              <a
                href="mailto:trevorbrown.web@gmail.com"
                className="text-blue-600 hover:underline"
              >
                trevorbrown.web@gmail.com
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
