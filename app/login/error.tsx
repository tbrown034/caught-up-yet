"use client";

import Button from "@/components/ui/Button";

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-4xl font-bold text-red-600">Login Error</h1>
        <p className="text-gray-600">
          {error.message || "Something went wrong during login"}
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="primary" onClick={reset}>
            Try Again
          </Button>
          <Button variant="secondary" href="/" asLink>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
