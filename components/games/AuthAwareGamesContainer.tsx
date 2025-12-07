"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ESPNGame, Sport, fetchAllSportsGames } from "@/lib/espn-api";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import DateNavigation from "./DateNavigation";
import SportTabs from "./SportTabs";
import GameCard from "./GameCard";
import GuestBanner from "./GuestBanner";
import AuthUserBanner from "./AuthUserBanner";

interface AuthAwareGamesContainerProps {
  initialGames: ESPNGame[];
  initialDate: Date;
}

export default function AuthAwareGamesContainer({
  initialGames,
  initialDate,
}: AuthAwareGamesContainerProps) {
  const supabase = createClient();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedSport, setSelectedSport] = useState<Sport | "all">("all");
  const [games, setGames] = useState<ESPNGame[]>(initialGames);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [spoilerProtection, setSpoilerProtection] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user && !user.is_anonymous);
    }
    checkAuth();
  }, [supabase.auth]);

  useEffect(() => {
    async function fetchGames() {
      if (selectedDate.toDateString() === initialDate.toDateString()) {
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
    mlb: games.filter((g) => g.sport === "mlb").length,
    nba: games.filter((g) => g.sport === "nba").length,
    nhl: games.filter((g) => g.sport === "nhl").length,
    cfb: games.filter((g) => g.sport === "cfb").length,
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const dateLabel = isToday
    ? "Today's Games"
    : selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">{dateLabel}</h1>

      {/* Show appropriate banner based on auth status */}
      {isAuthenticated === true && <AuthUserBanner />}
      {isAuthenticated === false && <GuestBanner />}

      <DateNavigation
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Spoiler Protection Toggle */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            {spoilerProtection ? (
              <EyeSlashIcon className="w-5 h-5 text-blue-600" />
            ) : (
              <EyeIcon className="w-5 h-5 text-gray-500" />
            )}
            <span className="text-sm font-semibold text-gray-900">
              Spoiler Protection
            </span>
          </div>
          <button
            onClick={() => setSpoilerProtection(!spoilerProtection)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              spoilerProtection ? "bg-blue-600" : "bg-gray-400"
            }`}
            aria-label="Toggle spoiler protection"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                spoilerProtection ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-xs text-gray-600">
            {spoilerProtection ? "Scores Hidden" : "Scores Visible"}
          </span>
        </div>
      </div>

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
            <GameCard key={game.id} game={game} spoilerProtection={spoilerProtection} />
          ))}
        </div>
      )}
    </div>
  );
}
