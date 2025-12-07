/**
 * Score Calculator
 *
 * Calculates the game score at any given position based on scoring plays.
 * This enables spoiler-free score display as users scrub through the game.
 */

import type { ScoringPlay } from "./database.types";

interface Score {
  away: number;
  home: number;
}

/**
 * Get the score at a specific encoded position
 *
 * @param scoringPlays - Array of scoring events with period/clock/scores
 * @param positionEncoded - User's current encoded position
 * @param sport - Sport type for position decoding
 * @returns The score at that moment in the game
 */
export function getScoreAtPosition(
  scoringPlays: ScoringPlay[] | undefined,
  positionEncoded: number,
  sport: "nfl" | "mlb" | "nba" | "nhl" | "cfb"
): Score {
  // No scoring plays = score is 0-0
  if (!scoringPlays || scoringPlays.length === 0) {
    return { away: 0, home: 0 };
  }

  // Convert user's encoded position to period/clock format for comparison
  const userPosition = decodePositionForComparison(positionEncoded, sport);

  // Find the last scoring play that occurred BEFORE or AT user's position
  let lastRelevantPlay: ScoringPlay | null = null;

  for (const play of scoringPlays) {
    // Check if this play happened before or at user's current position
    if (isPlayBeforePosition(play, userPosition, sport)) {
      lastRelevantPlay = play;
    }
  }

  if (!lastRelevantPlay) {
    return { away: 0, home: 0 };
  }

  return {
    away: lastRelevantPlay.awayScore,
    home: lastRelevantPlay.homeScore,
  };
}

interface PositionForComparison {
  period: number;
  secondsRemaining: number;
}

/**
 * Decode encoded position into period + seconds remaining for comparison
 */
function decodePositionForComparison(
  encoded: number,
  sport: "nfl" | "mlb" | "nba" | "nhl" | "cfb"
): PositionForComparison {
  switch (sport) {
    case "nfl":
    case "cfb": {
      // NFL: 900 positions per quarter (15 min = 900 sec)
      const quarter = Math.min(Math.floor(encoded / 900) + 1, 4);
      const secondsElapsed = encoded % 900;
      const secondsRemaining = 900 - secondsElapsed;
      return { period: quarter, secondsRemaining };
    }
    case "nba": {
      // NBA: 720 positions per quarter (12 min = 720 sec)
      const quarter = Math.min(Math.floor(encoded / 720) + 1, 4);
      const secondsElapsed = encoded % 720;
      const secondsRemaining = 720 - secondsElapsed;
      return { period: quarter, secondsRemaining };
    }
    case "nhl": {
      // NHL: 1200 positions per period (20 min = 1200 sec)
      const period = Math.min(Math.floor(encoded / 1200) + 1, 3);
      const secondsElapsed = encoded % 1200;
      const secondsRemaining = 1200 - secondsElapsed;
      return { period, secondsRemaining };
    }
    case "mlb": {
      // MLB: 8 positions per inning (Top: 0,1,2,3 | Bottom: 4,5,6,7)
      const inning = Math.floor(encoded / 8) + 1;
      const remainder = encoded % 8;
      // For MLB, we use "secondsRemaining" as a proxy (higher = earlier in inning)
      // This works because we're comparing within the same sport
      const secondsRemaining = 7 - remainder; // 7=top 0 outs, 0=bottom end
      return { period: inning, secondsRemaining };
    }
    default:
      return { period: 1, secondsRemaining: 0 };
  }
}

/**
 * Check if a scoring play occurred before or at the user's current position
 */
function isPlayBeforePosition(
  play: ScoringPlay,
  userPosition: PositionForComparison,
  sport: "nfl" | "mlb" | "nba" | "nhl" | "cfb"
): boolean {
  // If play is in an earlier period, it's before
  if (play.period < userPosition.period) {
    return true;
  }

  // If play is in a later period, it's after
  if (play.period > userPosition.period) {
    return false;
  }

  // Same period - compare clock time
  // For time-based sports (NFL, NBA, NHL), higher clockValue = earlier in period
  // For MLB, we compare outs/position differently

  if (sport === "mlb") {
    // MLB: play.clockValue is not time-based, we need to use the inning half/outs
    // Since we're in the same inning, any play that happened is visible
    // This is a simplification - MLB scoring plays don't have sub-inning granularity
    return true;
  }

  // Time-based sports: compare seconds remaining
  // Play happened if its clock time is >= user's clock time (more time remaining = earlier)
  return play.clockValue >= userPosition.secondsRemaining;
}

/**
 * Get all scoring plays that occurred up to the user's position
 * Useful for displaying a scoring summary
 */
export function getScoringPlaysUpToPosition(
  scoringPlays: ScoringPlay[] | undefined,
  positionEncoded: number,
  sport: "nfl" | "mlb" | "nba" | "nhl" | "cfb"
): ScoringPlay[] {
  if (!scoringPlays || scoringPlays.length === 0) {
    return [];
  }

  const userPosition = decodePositionForComparison(positionEncoded, sport);

  return scoringPlays.filter((play) =>
    isPlayBeforePosition(play, userPosition, sport)
  );
}
