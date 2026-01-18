"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { ESPNGame } from "@/lib/espn-api";

interface ClassifiedHeroProps {
  games?: ESPNGame[];
}

// Get team name - prefer short display name (e.g., "Bears") over abbreviation
function getTeamName(team: { team: { shortDisplayName?: string; abbreviation?: string; displayName: string } }) {
  return team.team.shortDisplayName || team.team.displayName.split(" ").pop() || team.team.abbreviation || "TEAM";
}

// Create redaction block sized to the hidden word
function redact(word: string): string {
  return "█".repeat(word.length);
}

// LIVE GAME templates - teams visible, action/score redacted
const liveTemplates = [
  (away: string, home: string) => [away, redact("LEADS"), home, "—", redact("SCORE")],
  (away: string, home: string) => [away, redact("BATTLES"), home, "—", redact("LIVE")],
  (away: string, home: string) => [away, redact("FACING"), home, "—", redact("NOW")],
  (away: string, home: string) => [away, "AT", home, "—", redact("IN PROGRESS")],
];

// FINAL GAME templates - teams visible, result redacted
const finalTemplates = [
  (away: string, home: string) => [away, redact("DEFEATS"), home, "—", redact("FINAL")],
  (away: string, home: string) => [away, redact("BEATS"), home, "—", redact("DONE")],
  (away: string, home: string) => [away, redact("TOPS"), home, "—", redact("OVER")],
  (away: string, home: string) => [away, "VS", home, "—", redact("RESULT")],
];

// SCHEDULED GAME templates - teams visible, nothing to hide yet
const scheduledTemplates = [
  (away: string, home: string) => [away, "VS", home, "—", "TONIGHT"],
  (away: string, home: string) => [away, "AT", home, "—", "COMING UP"],
  (away: string, home: string) => [away, "VS", home, "—", "WHO WINS?"],
  (away: string, home: string) => ["TONIGHT:", away, "AT", home],
];

// Generate headline based on game status
function generateHeadline(game: ESPNGame, index: number = 0): string[] {
  const away = getTeamName(game.competitors[0]).toUpperCase();
  const home = getTeamName(game.competitors[1]).toUpperCase();
  const status = game.status.type;

  if (status === "STATUS_IN_PROGRESS") {
    return liveTemplates[index % liveTemplates.length](away, home);
  }

  if (status === "STATUS_FINAL" || status === "POST") {
    return finalTemplates[index % finalTemplates.length](away, home);
  }

  // Scheduled
  return scheduledTemplates[index % scheduledTemplates.length](away, home);
}

// Generate status line based on game state
function generateStatus(game: ESPNGame): string {
  const status = game.status.type;

  if (status === "STATUS_IN_PROGRESS") {
    const period = game.status.period || 1;
    const clock = game.status.displayClock || "";

    switch (game.sport) {
      case "mlb": {
        const half = period % 2 === 1 ? "Top" : "Bot";
        const inning = Math.ceil(period / 2);
        return `${half} ${inning}${getOrdinal(inning)} • Live`;
      }
      case "nfl":
      case "cfb":
        return period > 4 ? `OT ${clock} • Live` : `${period}Q ${clock} • Live`;
      case "nba":
        return period > 4 ? `${period - 4}OT ${clock} • Live` : `${period}Q ${clock} • Live`;
      case "nhl":
        return period > 3 ? `OT ${clock} • Live` : `${period}${getOrdinal(period)} ${clock} • Live`;
      default:
        return `${period}Q ${clock} • Live`;
    }
  }

  if (status === "STATUS_FINAL" || status === "POST") {
    const period = game.status.period || 4;
    if (game.sport === "nba" && period > 4) return `Final/${period - 4}OT`;
    if (game.sport === "nhl" && period > 3) return `Final/OT`;
    if ((game.sport === "nfl" || game.sport === "cfb") && period > 4) return `Final/OT`;
    return "Final";
  }

  // Scheduled - show time
  const gameDate = new Date(game.date);
  const timeStr = gameDate.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/New_York"
  });
  return `Tonight ${timeStr} ET`;
}

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// Fallback headlines when no games available
const fallbackHeadlines = [
  { words: ["BEARS", redact("LEADS"), "PACKERS", "—", redact("SCORE")], status: "4Q 2:15 • Live" },
  { words: ["CUBS", redact("DEFEATS"), "CARDINALS", "—", redact("FINAL")], status: "Final" },
  { words: ["LAKERS", redact("BATTLES"), "CELTICS", "—", redact("LIVE")], status: "3Q 8:42 • Live" },
  { words: ["CHIEFS", "VS", "RAVENS", "—", "TONIGHT"], status: "Tonight 7:00 PM ET" },
];

export default function ClassifiedHero({ games = [] }: ClassifiedHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Process games into headlines - show variety: 1 final, 1 live (if any), 1 scheduled
  const headlines = useMemo(() => {
    if (!games || games.length === 0) {
      return fallbackHeadlines.map(h => ({ ...h, game: null }));
    }

    // Separate games by status
    const liveGames = games.filter(g => g.status.type === "STATUS_IN_PROGRESS");
    const finalGames = games.filter(g => g.status.type === "STATUS_FINAL" || g.status.type === "POST");
    const scheduledGames = games.filter(g =>
      g.status.type !== "STATUS_IN_PROGRESS" &&
      g.status.type !== "STATUS_FINAL" &&
      g.status.type !== "POST"
    );

    // Build a diverse selection: 1 of each type if available, then fill with more
    const selected: typeof games = [];

    // Add 1 final game first (shows the "classified result" concept)
    if (finalGames.length > 0) {
      selected.push(finalGames[0]);
    }

    // Add 1 live game (shows real-time classified action)
    if (liveGames.length > 0) {
      selected.push(liveGames[0]);
    }

    // Add 1 scheduled game (shows upcoming matchup)
    if (scheduledGames.length > 0) {
      selected.push(scheduledGames[0]);
    }

    // Fill up to 4 games with more real data (prioritize: more live, more final, more scheduled)
    const maxGames = 4;
    if (selected.length < maxGames && liveGames.length > 1) {
      const toAdd = Math.min(liveGames.length - 1, maxGames - selected.length);
      selected.push(...liveGames.slice(1, 1 + toAdd));
    }
    if (selected.length < maxGames && finalGames.length > 1) {
      const toAdd = Math.min(finalGames.length - 1, maxGames - selected.length);
      selected.push(...finalGames.slice(1, 1 + toAdd));
    }
    if (selected.length < maxGames && scheduledGames.length > 1) {
      const toAdd = Math.min(scheduledGames.length - 1, maxGames - selected.length);
      selected.push(...scheduledGames.slice(1, 1 + toAdd));
    }

    // If no games at all, use fallbacks
    if (selected.length === 0) {
      return fallbackHeadlines.map(h => ({ ...h, game: null }));
    }

    // Build headlines from selected games - only use REAL data, no fake padding
    return selected.map((game, index) => ({
      words: generateHeadline(game, index),
      status: generateStatus(game),
      game
    }));
  }, [games]);

  // Auto-rotate every 6 seconds (slower for readability)
  useEffect(() => {
    if (headlines.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % headlines.length);
        setIsTransitioning(false);
      }, 300);
    }, 6000);

    return () => clearInterval(interval);
  }, [headlines.length]);

  const current = headlines[currentIndex] || fallbackHeadlines[0];

  return (
    <section className="py-16 bg-gray-100 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Classified label */}
        <p className="uppercase text-xs tracking-[0.25em] text-gray-500 dark:text-gray-400 mb-4 font-medium">
          Classified
        </p>

        {/* Redacted headline */}
        <div
          className={`transition-opacity duration-300 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight mb-4 text-gray-900 dark:text-white">
            {current.words.map((word, i) => {
              const isRedacted = word.includes("█");
              if (isRedacted) {
                return (
                  <span
                    key={i}
                    className="inline-block mx-1 bg-gray-900 dark:bg-white rounded-sm px-1"
                    style={{ minWidth: `${Math.max(word.length * 0.4, 2)}em` }}
                    aria-hidden="true"
                  >
                    <span className="invisible">{word}</span>
                  </span>
                );
              }
              return (
                <span key={i} className="mx-1">
                  {word}
                </span>
              );
            })}
          </h2>

          {/* Status line */}
          <p className="text-sm sm:text-base tracking-wide text-gray-600 dark:text-gray-400 mb-6 font-mono">
            {current.status}
          </p>
        </div>

        {/* Sport indicator dots */}
        {headlines.length > 1 && (
          <div className="flex justify-center gap-2 mb-6">
            {headlines.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex(i);
                    setIsTransitioning(false);
                  }, 300);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex
                    ? "bg-blue-600 w-6"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                aria-label={`Go to headline ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Watch games spoiler-free with friends
        </p>
        <Link
          href="/games"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Browse Games
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
