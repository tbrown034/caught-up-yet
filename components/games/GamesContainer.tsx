"use client";

import { useState, useEffect } from "react";
import { ESPNGame, Sport, fetchAllSportsGames } from "@/lib/espn-api";
import DateNavigation from "./DateNavigation";
import SportTabs from "./SportTabs";
import GameCard from "./GameCard";

interface GamesContainerProps {
  initialGames: ESPNGame[];
  initialDate: Date;
}

export default function GamesContainer({
  initialGames,
  initialDate,
}: GamesContainerProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedSport, setSelectedSport] = useState<Sport | "all">("all");
  const [games, setGames] = useState<ESPNGame[]>(initialGames);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGames() {
      if (selectedDate.toDateString() === initialDate.toDateString()) {
        // Use initial server-rendered games
        setGames(initialGames);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const newGames = await fetchAllSportsGames(selectedDate);
        setGames(newGames);
      } catch (err) {
        setError("Failed to load games. Please try again.");
        console.error("Error fetching games:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, [selectedDate, initialDate, initialGames]);

  const filteredGames =
    selectedSport === "all"
      ? games
      : games.filter((game) => game.sport === selectedSport);

  const gameCounts: Record<Sport, number> = {
    nfl: games.filter((g) => g.sport === "nfl").length,
    nba: games.filter((g) => g.sport === "nba").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Today's Games</h1>

      <DateNavigation
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <SportTabs
        selectedSport={selectedSport}
        onSportChange={setSelectedSport}
        gameCounts={gameCounts}
      />

      {error && (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading games...</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            No {selectedSport === "all" ? "" : selectedSport.toUpperCase()}{" "}
            games scheduled for this day.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
