"use client";

export default function MlbPositionPlaceholder() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Where are you in the game?
      </h3>

      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">⚾</span>
        </div>
        <p className="text-gray-600 font-medium mb-2">
          MLB Position Tracking Coming Soon
        </p>
        <p className="text-sm text-gray-500">
          Baseball position tracking will be available during the regular season.
          For now, all messages are visible in MLB watch parties.
        </p>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-900">
          <strong>Note:</strong> MLB position tracking requires inning and out tracking,
          which will be implemented for the 2026 season.
        </p>
      </div>
    </div>
  );
}
