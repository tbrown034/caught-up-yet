"use client";

import Button from "@/components/ui/Button";

export default function GamesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col gap-4 text-center max-w-md">
        <h1 className="text-4xl font-bold text-red-600">
          Failed to Load Games
        </h1>
        <p className="text-gray-600">
          {error.message ||
            "There was a problem fetching game data from ESPN. The API might be temporarily unavailable."}
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="primary" onClick={reset}>
            Try Again
          </Button>
          <Button variant="secondary" href="/" asLink>
            Go Home
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Note: This app uses ESPN's unofficial API which may occasionally be
          unavailable.
        </p>
      </div>
    </div>
  );
}
