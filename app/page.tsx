import Button from "@/components/ui/Button";
import { fetchAllSportsGames } from "@/lib/espn-api";
import AnimatedHero from "@/components/home/AnimatedHero";
import HomeGameCard from "@/components/home/HomeGameCard";
import {
  UserGroupIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

export default async function Home() {
  const games = await fetchAllSportsGames(new Date());
  const liveGames = games
    .filter((game) => game.status.type === "STATUS_IN_PROGRESS")
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <AnimatedHero />

      {/* How It Works - Simple version */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">
            How It Works
          </h2>

          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Start a Party
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pick a game and create a watch party. Share the code with
                friends.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Watch at Your Pace
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Everyone tracks where they are in the game. No need to sync up
                perfectly.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                React Together
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Messages only appear when you reach that moment. No spoilers,
                just fun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Games Section - Only shows if there are live games */}
      {liveGames.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-semibold rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  LIVE NOW
                </span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {liveGames.length} {liveGames.length === 1 ? "Game" : "Games"}{" "}
                  in Progress
                </h2>
              </div>
              <Button variant="ghost" size="sm" href="/games" asLink>
                View All
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveGames.map((game) => (
                <HomeGameCard key={game.id} game={game} />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button variant="primary" href="/games" asLink>
                Create a Watch Party
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
