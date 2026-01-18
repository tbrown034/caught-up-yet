"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import AuthAwareButton from "@/components/ui/AuthAwareButton";
import Button from "@/components/ui/Button";

export default function HeroCTA() {
  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <AuthAwareButton
          authenticatedHref="/games"
          unauthenticatedHref="/games"
          variant="primary"
          size="lg"
        >
          <PlayIcon className="w-5 h-5 mr-2" />
          Get Started
        </AuthAwareButton>
        <Button variant="ghost" size="lg" href="/about" asLink>
          Learn More
        </Button>
      </div>
    </>
  );
}
