import {
  MagnifyingGlassIcon,
  HomeIcon,
  TvIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";

/**
 * 404 Not Found page
 * Shown when a route doesn't exist
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-6 text-center max-w-lg">
        {/* Icon */}
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <MagnifyingGlassIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">
            404
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Page not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        {/* Quick Links */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 w-full">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Here are some helpful links:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="/"
              className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-sm text-gray-700 dark:text-gray-300"
            >
              <HomeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Home
            </a>
            <a
              href="/games"
              className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-sm text-gray-700 dark:text-gray-300"
            >
              <TvIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Games
            </a>
            <a
              href="/rooms/join"
              className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-sm text-gray-700 dark:text-gray-300"
            >
              <UserGroupIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Join Party
            </a>
            <a
              href="/dashboard"
              className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors text-sm text-gray-700 dark:text-gray-300"
            >
              <TvIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Dashboard
            </a>
          </div>
        </div>

        {/* Primary Action */}
        <Button variant="primary" href="/" asLink>
          <HomeIcon className="w-4 h-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
