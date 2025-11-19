"use client";

import { Play, CheckCircle } from "lucide-react";
import AuthAwareButton from "@/components/ui/AuthAwareButton";
import Button from "@/components/ui/Button";

export default function FinalCTA() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          Ready to Watch Without Spoilers?
        </h2>
        <p className="text-xl text-gray-600 mb-10">
          Join families and friends who are already enjoying sports together—on
          their own time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <AuthAwareButton
            authenticatedHref="/games"
            unauthenticatedHref="/games"
            variant="primary"
            size="lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Your First Watch Party
          </AuthAwareButton>
          <Button variant="ghost" size="lg" href="/about" asLink>
            Learn More
          </Button>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Free for Small Groups</p>
              <p className="text-sm text-gray-600">
                Perfect for families and close friends
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">No Credit Card</p>
              <p className="text-sm text-gray-600">
                Sign up with Google in seconds
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Private & Secure</p>
              <p className="text-sm text-gray-600">
                Your watch parties stay private
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
