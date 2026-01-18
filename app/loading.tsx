export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="animate-pulse">
        {/* Hero Section Skeleton */}
        <div className="py-20 px-4 text-center">
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-80 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-96 mx-auto mb-8"></div>
          <div className="flex justify-center gap-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-40"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
          </div>
        </div>

        {/* How It Works Skeleton */}
        <div className="py-16 px-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-40 mx-auto mb-10"></div>
          <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-4"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-48 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Games Section Skeleton */}
        <div className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48"></div>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-20"></div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
