import Button from "@/components/ui/Button";
import { fetchAllSportsGames } from "@/lib/espn-api";
import {
  Clock,
  Shield,
  Users,
  MessageCircle,
  CheckCircle,
  Zap,
  Trophy,
  Play,
} from "lucide-react";
import Image from "next/image";

export default async function Home() {
  // Fetch today's games for the live preview section
  const games = await fetchAllSportsGames(new Date());
  const liveGames = games.filter((game) => game.status.type === "STATUS_IN_PROGRESS").slice(0, 3);
  const upcomingGames = games.filter((game) => game.status.type === "STATUS_SCHEDULED").slice(0, 3);
  const displayGames = liveGames.length > 0 ? liveGames : upcomingGames;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-sm">
              <Trophy className="w-4 h-4" />
              <span>Watch Sports on Your Schedule</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Watch Games Together,
              <br />
              <span className="text-blue-600">But No Spoilers</span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Share real-time reactions with friends and family while watching
              at different times. Messages reveal only when you reach that moment, just
              like watching together on the couch.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="primary" size="lg" href="/login" asLink>
                <Play className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
              <Button variant="ghost" size="lg" href="/about" asLink>
                Learn More
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              No credit card required • Free for small groups
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              The Spoiler Problem
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Your brother watches the game live. You're watching on DVR delay with the kids.
              The group chat lights up with "TOUCHDOWN!" but you're still in the first quarter.
              Game ruined. Sound familiar?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-red-50 border border-red-100 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Spoiled Moments</h3>
              <p className="text-gray-600 text-sm">
                Group chats ruin big plays before you see them
              </p>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Different Schedules</h3>
              <p className="text-gray-600 text-sm">
                Everyone watches at different times with live, DVR or streaming delays
              </p>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Missing the Fun</h3>
              <p className="text-gray-600 text-sm">
                You avoid the chat entirely, missing the shared experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How Caught Up Yet? Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Share the excitement without the spoilers. It's like a magic group chat
              that knows where everyone is in the game.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Spoiler-Free Messages</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Messages only appear when you reach that moment in the game. No accidents,
                no spoilers.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Watch on Your Time</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Live, DVR or streaming, it doesn't matter. Everyone stays synced without watching
                simultaneously.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Private Groups</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Create watch parties with family and friends. Keep your reactions
                intimate and personal.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-Time Sync</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Powered by live game data from ESPN. Track progress across NFL and NBA.
              </p>
            </div>
          </div>

          {/* How It Works Steps */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Create a Watch Party</h3>
              <p className="text-gray-600 text-sm">
                Pick a game and invite your friends or family to join
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Watch & React</h3>
              <p className="text-gray-600 text-sm">
                Share reactions as you watch. Messages are timestamped automatically
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">Stay Synced</h3>
              <p className="text-gray-600 text-sm">
                Everyone sees messages only when they reach that point with no spoilers!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Games Preview */}
      {displayGames.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {liveGames.length > 0 ? "Live Right Now" : "Coming Up Today"}
              </h2>
              <p className="text-lg text-gray-600">
                Real-time sports data integrated with every watch party
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {displayGames.map((game) => (
                <div
                  key={game.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      {game.sport.toUpperCase()}
                    </span>
                    {game.status.type === "STATUS_IN_PROGRESS" ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">
                        {new Date(game.date).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {game.competitors.map((competitor) => (
                      <div key={competitor.team.abbreviation} className="flex items-center gap-3">
                        <div className="w-10 h-10 relative flex-shrink-0">
                          <Image
                            src={competitor.team.logo}
                            alt={competitor.team.displayName}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {competitor.team.displayName}
                          </p>
                        </div>
                        {competitor.score && (
                          <span className="text-2xl font-bold text-gray-900">
                            {competitor.score}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {game.status.displayClock && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-600">
                      {game.status.displayClock} • {game.status.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button variant="ghost" size="md" href="/games" asLink>
                View All Games
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Use Case Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              It's Like Watching Together on the Couch
            </h2>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              Remember when everyone could watch the game together? Now you can have that
              same shared experience even when watching hours apart. Dad's watching live,
              you're catching up after the kids go to bed and your sister's watching the
              replay tomorrow. Everyone gets the full experience with no spoilers.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
              <div className="flex items-start gap-4 text-left">
                <CheckCircle className="w-6 h-6 text-blue-200 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-white mb-2">Real Family Story</p>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    "My brother watches games live on the East Coast. I watch 3 hours delayed
                    on the West Coast. Before Caught Up Yet?, we couldn't text during games.
                    Now we share every moment, even though we're watching at completely different
                    times. It's amazing."
                  </p>
                  <p className="text-blue-200 text-xs mt-3">— Beta Tester, San Francisco</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Supported */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              All Your Favorite Sports
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              Integrated with live data from ESPN
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              {["NFL", "NBA"].map((sport) => (
                <div
                  key={sport}
                  className="bg-white border-2 border-gray-200 rounded-lg px-8 py-6 shadow-sm hover:border-blue-600 hover:shadow-md transition-all"
                >
                  <p className="text-2xl font-bold text-gray-900">{sport}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Ready to Watch Without Spoilers?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join families and friends who are already enjoying sports together on their own time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="primary" size="lg" href="/login" asLink>
              <Play className="w-5 h-5 mr-2" />
              Start Your First Watch Party
            </Button>
            <Button variant="ghost" size="lg" href="/about" asLink>
              Learn More
            </Button>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Free for Small Groups</p>
                <p className="text-sm text-gray-600">Perfect for families and close friends</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">No Credit Card</p>
                <p className="text-sm text-gray-600">Sign up with Google in seconds</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Private & Secure</p>
                <p className="text-sm text-gray-600">Your watch parties stay private</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
