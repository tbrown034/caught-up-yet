// Game position utilities for spoiler protection
// Simple position comparison without complex encoding

import type {
  GamePosition,
  NflPosition,
  MlbPosition,
  NbaPosition,
  NhlPosition,
} from "./database.types";

// ============================================
// POSITION COMPARISON
// ============================================

/**
 * Compare two NFL positions
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareNflPositions(
  a: NflPosition,
  b: NflPosition
): -1 | 0 | 1 {
  // Compare quarters first
  if (a.quarter < b.quarter) return -1;
  if (a.quarter > b.quarter) return 1;

  // Same quarter, compare time (less time = further in game)
  const aSeconds = a.minutes * 60 + a.seconds;
  const bSeconds = b.minutes * 60 + b.seconds;

  if (aSeconds > bSeconds) return -1; // Less time elapsed
  if (aSeconds < bSeconds) return 1; // More time elapsed
  return 0;
}

/**
 * Compare two MLB positions
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareMlbPositions(
  a: MlbPosition,
  b: MlbPosition
): -1 | 0 | 1 {
  // Compare innings first
  if (a.inning < b.inning) return -1;
  if (a.inning > b.inning) return 1;

  // Same inning, compare half (TOP < BOTTOM)
  if (a.half === "TOP" && b.half === "BOTTOM") return -1;
  if (a.half === "BOTTOM" && b.half === "TOP") return 1;

  // Same half, compare outs
  const aOuts = a.outs ?? 0;
  const bOuts = b.outs ?? 0;

  if (aOuts < bOuts) return -1;
  if (aOuts > bOuts) return 1;
  return 0;
}

/**
 * Compare two NBA positions (same as NFL)
 */
export function compareNbaPositions(
  a: NbaPosition,
  b: NbaPosition
): -1 | 0 | 1 {
  if (a.quarter < b.quarter) return -1;
  if (a.quarter > b.quarter) return 1;

  const aSeconds = a.minutes * 60 + a.seconds;
  const bSeconds = b.minutes * 60 + b.seconds;

  if (aSeconds > bSeconds) return -1;
  if (aSeconds < bSeconds) return 1;
  return 0;
}

/**
 * Compare two NHL positions (same as NFL but with periods)
 */
export function compareNhlPositions(
  a: NhlPosition,
  b: NhlPosition
): -1 | 0 | 1 {
  if (a.period < b.period) return -1;
  if (a.period > b.period) return 1;

  const aSeconds = a.minutes * 60 + a.seconds;
  const bSeconds = b.minutes * 60 + b.seconds;

  if (aSeconds > bSeconds) return -1;
  if (aSeconds < bSeconds) return 1;
  return 0;
}

// ============================================
// SPOILER PROTECTION
// ============================================

/**
 * Check if a message should be visible to a user
 * THE RULE: User can see message if message position <= user position
 */
export function isMessageVisible(
  messagePosition: GamePosition,
  userPosition: GamePosition,
  sport: "nfl" | "mlb" | "nba" | "nhl" | "cfb"
): boolean {
  try {
    let comparison: -1 | 0 | 1;

    switch (sport) {
      case "nfl":
      case "cfb": // College football uses same format as NFL
        comparison = compareNflPositions(
          messagePosition as NflPosition,
          userPosition as NflPosition
        );
        break;
      case "mlb":
        comparison = compareMlbPositions(
          messagePosition as MlbPosition,
          userPosition as MlbPosition
        );
        break;
      case "nba":
        comparison = compareNbaPositions(
          messagePosition as NbaPosition,
          userPosition as NbaPosition
        );
        break;
      case "nhl":
        comparison = compareNhlPositions(
          messagePosition as NhlPosition,
          userPosition as NhlPosition
        );
        break;
      default:
        return false;
    }

    // Message is visible if it's at or before user's position
    return comparison <= 0;
  } catch (error) {
    console.error("Error comparing positions:", error);
    return false; // Hide message on error (safe default)
  }
}

// ============================================
// POSITION FORMATTING
// ============================================

/**
 * Format NFL position for display
 * Example: "Q3 8:02"
 */
export function formatNflPosition(pos: NflPosition): string {
  const mins = String(pos.minutes).padStart(2, "0");
  const secs = String(pos.seconds).padStart(2, "0");
  return `Q${pos.quarter} ${mins}:${secs}`;
}

/**
 * Format MLB position for display
 * Example: "Top 5th • 2 outs"
 */
export function formatMlbPosition(pos: MlbPosition): string {
  const half = pos.half === "TOP" ? "Top" : "Bottom";
  const inning = getOrdinal(pos.inning);
  const outs = pos.outs !== undefined ? ` • ${pos.outs} ${pos.outs === 1 ? "out" : "outs"}` : "";
  return `${half} ${inning}${outs}`;
}

/**
 * Format NBA position for display
 * Example: "Q2 6:45"
 */
export function formatNbaPosition(pos: NbaPosition): string {
  const mins = String(pos.minutes).padStart(2, "0");
  const secs = String(pos.seconds).padStart(2, "0");
  return `Q${pos.quarter} ${mins}:${secs}`;
}

/**
 * Format NHL position for display
 * Example: "P2 12:30"
 */
export function formatNhlPosition(pos: NhlPosition): string {
  const mins = String(pos.minutes).padStart(2, "0");
  const secs = String(pos.seconds).padStart(2, "0");
  return `P${pos.period} ${mins}:${secs}`;
}

/**
 * Format any game position based on sport
 */
export function formatGamePosition(
  pos: GamePosition,
  sport: "nfl" | "mlb" | "nba" | "nhl" | "cfb"
): string {
  switch (sport) {
    case "nfl":
    case "cfb": // College football uses same format as NFL
      return formatNflPosition(pos as NflPosition);
    case "mlb":
      return formatMlbPosition(pos as MlbPosition);
    case "nba":
      return formatNbaPosition(pos as NbaPosition);
    case "nhl":
      return formatNhlPosition(pos as NhlPosition);
    default:
      return "Unknown";
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert number to ordinal (1 -> "1st", 2 -> "2nd", etc.)
 */
function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Get initial position for a sport (game start)
 */
export function getInitialPosition(
  sport: "nfl" | "mlb" | "nba" | "nhl" | "cfb"
): GamePosition {
  switch (sport) {
    case "nfl":
    case "cfb": // College football uses same format as NFL
      return { quarter: 1, minutes: 15, seconds: 0 } as NflPosition;
    case "mlb":
      return { inning: 1, half: "TOP", outs: 0 } as MlbPosition;
    case "nba":
      return { quarter: 1, minutes: 12, seconds: 0 } as NbaPosition;
    case "nhl":
      return { period: 1, minutes: 20, seconds: 0 } as NhlPosition;
    default:
      throw new Error(`Unsupported sport: ${sport}`);
  }
}

/**
 * Validate position format
 */
export function isValidPosition(
  pos: unknown,
  sport: "nfl" | "mlb" | "nba" | "nhl" | "cfb"
): boolean {
  if (!pos || typeof pos !== "object") return false;

  try {
    switch (sport) {
      case "nfl":
      case "cfb": {
        const nflPos = pos as NflPosition;
        return (
          typeof nflPos.quarter === "number" &&
          nflPos.quarter >= 1 &&
          nflPos.quarter <= 4 &&
          typeof nflPos.minutes === "number" &&
          typeof nflPos.seconds === "number"
        );
      }
      case "mlb": {
        const mlbPos = pos as MlbPosition;
        return (
          typeof mlbPos.inning === "number" &&
          mlbPos.inning >= 1 &&
          (mlbPos.half === "TOP" || mlbPos.half === "BOTTOM")
        );
      }
      case "nba": {
        const nbaPos = pos as NbaPosition;
        return (
          typeof nbaPos.quarter === "number" &&
          nbaPos.quarter >= 1 &&
          nbaPos.quarter <= 4 &&
          typeof nbaPos.minutes === "number" &&
          typeof nbaPos.seconds === "number"
        );
      }
      case "nhl": {
        const nhlPos = pos as NhlPosition;
        return (
          typeof nhlPos.period === "number" &&
          nhlPos.period >= 1 &&
          nhlPos.period <= 3 &&
          typeof nhlPos.minutes === "number" &&
          typeof nhlPos.seconds === "number"
        );
      }
      default:
        return false;
    }
  } catch {
    return false;
  }
}
