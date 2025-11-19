/**
 * Calculate scores at specific game positions from scoring plays
 */

import type { Sport } from "./espn-api";
import { decodePosition } from "./position-encoding";

export interface ScoringPlay {
  id: string;
  period: number;
  clock: string;
  clockValue: number; // Seconds remaining in period
  awayScore: number;
  homeScore: number;
  description?: string;
  teamId?: string;
}

export interface ScoreAtPosition {
  awayScore: number;
  homeScore: number;
}

/**
 * Convert position encoded value to a comparable clock value for filtering
 * Returns total elapsed seconds since game start
 */
function positionToElapsedSeconds(
  positionEncoded: number,
  sport: Sport
): number {
  const decoded = decodePosition(positionEncoded, sport);

  switch (sport) {
    case "nfl": {
      // Each quarter is 15 minutes (900 seconds)
      const pos = decoded as { quarter: number; minutes: number; seconds: number };
      const quarterElapsed = (pos.quarter - 1) * 900;
      const minutesElapsed = (15 - pos.minutes) * 60;
      const secondsElapsed = 60 - pos.seconds;
      return quarterElapsed + minutesElapsed + secondsElapsed;
    }

    case "nba": {
      // Each quarter is 12 minutes (720 seconds)
      const pos = decoded as { quarter: number; minutes: number; seconds: number };
      const quarterElapsed = (pos.quarter - 1) * 720;
      const minutesElapsed = (12 - pos.minutes) * 60;
      const secondsElapsed = 60 - pos.seconds;
      return quarterElapsed + minutesElapsed + secondsElapsed;
    }

    case "nhl": {
      // Each period is 20 minutes (1200 seconds)
      const pos = decoded as { period: number; minutes: number; seconds: number };
      const periodElapsed = (pos.period - 1) * 1200;
      const minutesElapsed = (20 - pos.minutes) * 60;
      const secondsElapsed = 60 - pos.seconds;
      return periodElapsed + minutesElapsed + secondsElapsed;
    }

    case "mlb": {
      // MLB is inning-based, approximate as outs (not time-based)
      // Each inning has 6 outs (3 top, 3 bottom)
      const pos = decoded as { inning: number; half: "TOP" | "BOTTOM"; outs: number };
      const inningElapsed = (pos.inning - 1) * 6;
      const halfElapsed = pos.half === "BOTTOM" ? 3 : 0;
      return inningElapsed + halfElapsed + pos.outs;
    }

    default:
      return 0;
  }
}

/**
 * Convert scoring play clock to elapsed seconds since game start
 */
function scoringPlayToElapsedSeconds(play: ScoringPlay, sport: Sport): number {
  switch (sport) {
    case "nfl":
    case "nba":
    case "nhl": {
      const periodLength =
        sport === "nfl" ? 900 : sport === "nba" ? 720 : 1200;
      const periodElapsed = (play.period - 1) * periodLength;
      const timeElapsed = periodLength - play.clockValue;
      return periodElapsed + timeElapsed;
    }

    case "mlb": {
      // For MLB, use period as inning (ESPN API provides this)
      // Clock will be "Top" or "Bot", but we use period mainly
      const inningElapsed = (play.period - 1) * 6;
      // Assume 3 outs per half for simplicity
      const halfElapsed = play.clock?.toLowerCase().includes("bot") ? 3 : 0;
      return inningElapsed + halfElapsed;
    }

    default:
      return 0;
  }
}

/**
 * Get the score at a specific position by filtering scoring plays
 * Returns the score after the last scoring play that occurred before or at this position
 */
export function getScoreAtPosition(
  positionEncoded: number,
  scoringPlays: ScoringPlay[],
  sport: Sport
): ScoreAtPosition {
  // Start with 0-0
  if (!scoringPlays || scoringPlays.length === 0) {
    return { awayScore: 0, homeScore: 0 };
  }

  const targetElapsed = positionToElapsedSeconds(positionEncoded, sport);

  // Filter plays that happened before or at this position
  const playsUpToNow = scoringPlays.filter((play) => {
    const playElapsed = scoringPlayToElapsedSeconds(play, sport);
    return playElapsed <= targetElapsed;
  });

  // If no plays yet, return 0-0
  if (playsUpToNow.length === 0) {
    return { awayScore: 0, homeScore: 0 };
  }

  // Sort by elapsed time and get the last play
  const sortedPlays = [...playsUpToNow].sort((a, b) => {
    const aElapsed = scoringPlayToElapsedSeconds(a, sport);
    const bElapsed = scoringPlayToElapsedSeconds(b, sport);
    return aElapsed - bElapsed;
  });

  const lastPlay = sortedPlays[sortedPlays.length - 1];

  return {
    awayScore: lastPlay.awayScore,
    homeScore: lastPlay.homeScore,
  };
}

/**
 * Check if a game is currently live based on status
 */
export function isGameLive(statusType: string): boolean {
  return (
    statusType === "STATUS_IN_PROGRESS" ||
    statusType === "IN_PROGRESS" ||
    statusType === "LIVE"
  );
}
