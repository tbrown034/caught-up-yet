"use client";

import { Sport } from "@/lib/espn-api";

interface SportTabsProps {
  selectedSport: Sport | "all";
  onSportChange: (sport: Sport | "all") => void;
  gameCounts: Record<Sport, number>;
}

export default function SportTabs({
  selectedSport,
  onSportChange,
  gameCounts,
}: SportTabsProps) {
  const tabs: Array<{ id: Sport | "all"; label: string }> = [
    { id: "all", label: "All" },
    { id: "nfl", label: "NFL" },
    { id: "cfb", label: "CFB" },
    { id: "mlb", label: "MLB" },
    { id: "nba", label: "NBA" },
    { id: "nhl", label: "NHL" },
  ];

  return (
    <div className="flex justify-start sm:justify-center gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      {tabs.map((tab) => {
        const isSelected = selectedSport === tab.id;
        const count = tab.id === "all"
          ? Object.values(gameCounts).reduce((a, b) => a + b, 0)
          : gameCounts[tab.id as Sport] || 0;

        return (
          <button
            key={tab.id}
            onClick={() => onSportChange(tab.id)}
            className={`
              px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all flex-shrink-0
              ${
                isSelected
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }
            `}
          >
            <span className="flex items-center gap-1.5 sm:gap-2">
              {tab.label}
              <span
                className={`
                  text-xs px-1.5 sm:px-2 py-0.5 rounded-full
                  ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }
                `}
              >
                {count}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
