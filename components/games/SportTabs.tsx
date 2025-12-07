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
    <div className="flex justify-center gap-2 mb-8 overflow-x-auto">
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
              px-6 py-3 rounded-lg font-semibold transition-all
              ${
                isSelected
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }
            `}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              <span
                className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600"
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
