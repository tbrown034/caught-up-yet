export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-64"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-12"></div>
            </div>
          ))}
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex gap-4 mb-8">
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-40"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
        </div>

        {/* Room Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
