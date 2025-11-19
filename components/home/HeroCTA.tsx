"use client";

import { Play } from "lucide-react";
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
          <Play className="w-5 h-5 mr-2" />
          Get Started Free
        </AuthAwareButton>
        <Button variant="ghost" size="lg" href="/about" asLink>
          Learn More
        </Button>
      </div>

      <p className="text-sm text-gray-500 mt-6">
        No credit card required • Free for small groups
      </p>
    </>
  );
}
