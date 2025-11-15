export default function GamesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        {/* Date Navigation Skeleton */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
        </div>

        {/* Sport Tabs Skeleton */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="h-12 w-24 bg-gray-200 rounded"></div>
          <div className="h-12 w-24 bg-gray-200 rounded"></div>
          <div className="h-12 w-24 bg-gray-200 rounded"></div>
          <div className="h-12 w-24 bg-gray-200 rounded"></div>
        </div>

        {/* Game Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-lg p-6 bg-white">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
                <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
