export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-48"></div>
        </div>

        {/* User Info Card Skeleton */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
            <div>
              <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-40 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-56"></div>
            </div>
          </div>
        </div>

        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-center"
            >
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-12 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Parties Section Skeleton */}
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-36 mb-4"></div>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
