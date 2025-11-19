/**
 * Calculate live position from game status and clock
 */

import { encodePosition } from "./position-encoding";
import type { NflPosition, NbaPosition, NhlPosition, MlbPosition, GameStatus } from "./database.types";

/**
 * Parse clock string like "8:14" or "0:45" to minutes and seconds
 */
function parseClock(clock: string): { minutes: number; seconds: number } {
  const [mins, secs] = clock.split(":").map(Number);
  return { minutes: mins || 0, seconds: secs || 0 };
}

/**
 * Calculate the live position encoded value based on game status
 * Returns the maximum position for finished games, 0 for scheduled games
 */
export function calculateLivePosition(
  status: GameStatus,
  sport: "nfl" | "mlb" | "nba" | "nhl"
): number | null {
  // Game hasn't started
  if (status.type === "STATUS_SCHEDULED" || status.type === "PRE") {
    return 0; // Return start position
  }

  // Game is over - return maximum position for the sport
  if (status.type === "STATUS_FINAL" || status.type === "POST" || status.type === "FINAL") {
    // Return end of game position
    switch (sport) {
      case "nfl":
        return encodePosition({ quarter: 5, minutes: 0, seconds: 0 }, "nfl");
      case "nba":
        return encodePosition({ quarter: 4, minutes: 0, seconds: 0 }, "nba");
      case "nhl":
        return encodePosition({ period: 3, minutes: 0, seconds: 0 }, "nhl");
      case "mlb":
        return encodePosition({ inning: 9, half: "BOTTOM", outs: 2 }, "mlb");
    }
  }

  // Game is in progress
  if (!status.period || !status.displayClock) {
    return null; // Not enough data
  }

  try {
    switch (sport) {
      case "nfl": {
        const { minutes, seconds } = parseClock(status.displayClock);
        const position: NflPosition = {
          quarter: Math.min(5, status.period) as 1 | 2 | 3 | 4 | 5,
          minutes,
          seconds,
        };
        return encodePosition(position, "nfl");
      }

      case "nba": {
        const { minutes, seconds } = parseClock(status.displayClock);
        const position: NbaPosition = {
          quarter: Math.min(8, status.period) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
          minutes,
          seconds,
        };
        return encodePosition(position, "nba");
      }

      case "nhl": {
        const { minutes, seconds } = parseClock(status.displayClock);
        const position: NhlPosition = {
          period: Math.min(5, status.period) as 1 | 2 | 3 | 4 | 5,
          minutes,
          seconds,
        };
        return encodePosition(position, "nhl");
      }

      case "mlb": {
        // MLB uses inning and half (top/bottom)
        // ESPN API provides period as inning number
        // For simplicity, if clock shows "Top" or "Bot", parse that
        // Otherwise default to TOP
        const half = status.displayClock?.toLowerCase().includes("bot")
          ? "BOTTOM"
          : "TOP";
        const position: MlbPosition = {
          inning: status.period,
          half,
          outs: 0, // We don't have outs data from status
        };
        return encodePosition(position, "mlb");
      }

      default:
        return null;
    }
  } catch (error) {
    console.error("Error calculating live position:", error);
    return null;
  }
}

/**
 * Check if a game is currently live
 */
export function isGameLive(status: GameStatus): boolean {
  return (
    status.type === "STATUS_IN_PROGRESS" ||
    status.type === "IN_PROGRESS" ||
    status.type === "LIVE"
  );
}
