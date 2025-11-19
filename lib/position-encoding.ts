/**
 * Position Encoding System for Spoiler-Safe Sports Viewing
 *
 * Core Philosophy: Every game moment maps to a unique monotonic integer.
 * Earlier moments have smaller numbers. Message filtering becomes: msg.pos <= user.pos
 *
 * Encoding Schemes:
 * - NFL: 900 positions per quarter (15 min = 900 sec)
 * - NBA: 720 positions per quarter (12 min = 720 sec)
 * - NHL: 1200 positions per period (20 min = 1200 sec)
 * - MLB: 8 positions per inning (Top: 0,1,2,END + Bottom: 0,1,2,END)
 */

import type {
  GamePosition,
  NflPosition,
  MlbPosition,
  NbaPosition,
  NhlPosition,
} from "./database.types";

// ============================================
// SENTINEL VALUES
// ============================================

export const PREGAME = -1;
export const POSTGAME = 1_000_000;

// Sport-specific max positions (for regular game end)
export const NFL_MAX = 3600; // 4 quarters * 900 seconds
export const NBA_MAX = 2880; // 4 quarters * 720 seconds
export const NHL_MAX = 3600; // 3 periods * 1200 seconds
export const MLB_MAX = 71;   // 9 innings * 8 positions - 1 (0-indexed: 72 total, max index 71)

// Overtime max positions (for games that go to OT)
export const NFL_OT_MAX = 4500; // 5 quarters * 900 (OT is 10 min but encoding uses 15 min slots)
export const NBA_OT_MAX = 3600; // 4 quarters + 1 OT = 5 quarters * 720
export const NHL_OT_MAX = 4800; // 3 periods + 1 OT = 4 periods * 1200

// ============================================
// ENCODING: Game State → Integer
// ============================================

/**
 * NFL: Each quarter has 900 positions (15 min = 900 sec)
 *
 * Q1 15:00 = 0 (start of game)
 * Q1 10:00 = 300 (5 min elapsed)
 * Q1 0:00 = 899 (end of Q1)
 * Q2 15:00 = 900
 * Q4 0:00 = 3599
 */
export function encodeNflPosition(pos: NflPosition): number {
  const timeInSeconds = pos.minutes * 60 + pos.seconds;
  const secondsElapsed = 900 - timeInSeconds;
  const quarterBase = (pos.quarter - 1) * 900;
  return quarterBase + secondsElapsed;
}

/**
 * NBA: Each quarter has 720 positions (12 min = 720 sec)
 *
 * Q1 12:00 = 0
 * Q1 6:00 = 360
 * Q1 0:00 = 719
 * Q2 12:00 = 720
 * Q4 0:00 = 2879
 */
export function encodeNbaPosition(pos: NbaPosition): number {
  const timeInSeconds = pos.minutes * 60 + pos.seconds;
  const secondsElapsed = 720 - timeInSeconds;
  const quarterBase = (pos.quarter - 1) * 720;
  return quarterBase + secondsElapsed;
}

/**
 * NHL: Each period has 1200 positions (20 min = 1200 sec)
 *
 * P1 20:00 = 0
 * P1 10:00 = 600
 * P1 0:00 = 1199
 * P2 20:00 = 1200
 * P3 0:00 = 3599
 */
export function encodeNhlPosition(pos: NhlPosition): number {
  const timeInSeconds = pos.minutes * 60 + pos.seconds;
  const secondsElapsed = 1200 - timeInSeconds;
  const periodBase = (pos.period - 1) * 1200;
  return periodBase + secondsElapsed;
}

/**
 * MLB: Each inning has 8 positions
 *
 * Top 1st, 0 outs = 0
 * Top 1st, 1 out = 1
 * Top 1st, 2 outs = 2
 * Top 1st, END = 3
 * Bottom 1st, 0 outs = 4
 * Bottom 1st, 1 out = 5
 * Bottom 1st, 2 outs = 6
 * Bottom 1st, END = 7
 * Top 2nd, 0 outs = 8
 * ...
 * Bottom 9th, END = 71
 */
export function encodeMlbPosition(pos: MlbPosition): number {
  const inningBase = (pos.inning - 1) * 8;
  const halfOffset = pos.half === "TOP" ? 0 : 4;
  // If outs is undefined, treat as END of half (3)
  // Otherwise use the out count (0, 1, or 2)
  const outsValue = pos.outs === undefined ? 3 : pos.outs;
  return inningBase + halfOffset + outsValue;
}

/**
 * Unified encoder - routes to sport-specific function
 */
export function encodePosition(
  pos: GamePosition,
  sport: "nfl" | "mlb" | "nba" | "nhl"
): number {
  switch (sport) {
    case "nfl":
      return encodeNflPosition(pos as NflPosition);
    case "nba":
      return encodeNbaPosition(pos as NbaPosition);
    case "nhl":
      return encodeNhlPosition(pos as NhlPosition);
    case "mlb":
      return encodeMlbPosition(pos as MlbPosition);
    default:
      throw new Error(`Unsupported sport: ${sport}`);
  }
}

// ============================================
// DECODING: Integer → Game State
// ============================================

/**
 * Decode NFL position from integer
 * Supports OT (quarter 5)
 */
export function decodeNflPosition(encoded: number): NflPosition {
  if (encoded <= PREGAME) {
    return { quarter: 1, minutes: 15, seconds: 0 };
  }
  if (encoded >= NFL_OT_MAX) {
    return { quarter: 5, minutes: 0, seconds: 0 };
  }
  if (encoded >= NFL_MAX && encoded < 3600) {
    return { quarter: 4, minutes: 0, seconds: 0 };
  }

  // Handle exact quarter boundaries (e.g., 900 = Q2 15:00, not Q1 0:00)
  // When encoded = 900, it's the START of Q2, not end of Q1
  const quarter = Math.min(Math.floor(encoded / 900) + 1, 5) as 1 | 2 | 3 | 4 | 5;
  const secondsElapsedInQuarter = encoded % 900;
  const timeRemainingInSeconds = 900 - secondsElapsedInQuarter;

  // If encoded % 900 = 0 and encoded > 0, we're at a quarter boundary
  // which means 0:00 of previous quarter, not 15:00 of current quarter
  if (secondsElapsedInQuarter === 0 && encoded > 0) {
    // This is actually the end of the previous quarter (0:00)
    const actualQuarter = Math.min(Math.floor((encoded - 1) / 900) + 1, 5) as 1 | 2 | 3 | 4 | 5;
    return { quarter: actualQuarter, minutes: 0, seconds: 0 };
  }

  const minutes = Math.floor(timeRemainingInSeconds / 60);
  const seconds = timeRemainingInSeconds % 60;

  return { quarter, minutes, seconds };
}

/**
 * Decode NBA position from integer
 * Supports OT periods (quarters 5+)
 */
export function decodeNbaPosition(encoded: number): NbaPosition {
  if (encoded <= PREGAME) {
    return { quarter: 1, minutes: 12, seconds: 0 };
  }
  // NBA OT is 5 minutes, but we still use 720-second slots for consistency
  const maxOtQuarter = Math.min(Math.floor(encoded / 720) + 1, 8);
  if (encoded >= NBA_OT_MAX) {
    return { quarter: 5, minutes: 0, seconds: 0 };
  }

  const secondsElapsedInQuarter = encoded % 720;

  // Handle exact quarter boundaries (e.g., 720 = Q2 12:00, but prefer Q1 0:00)
  if (secondsElapsedInQuarter === 0 && encoded > 0) {
    const actualQuarter = Math.min(Math.floor((encoded - 1) / 720) + 1, 8) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    return { quarter: actualQuarter, minutes: 0, seconds: 0 };
  }

  const quarter = Math.min(Math.floor(encoded / 720) + 1, 8) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  const timeRemaining = 720 - secondsElapsedInQuarter;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return { quarter, minutes, seconds };
}

/**
 * Decode NHL position from integer
 * Supports OT periods (period 4+)
 */
export function decodeNhlPosition(encoded: number): NhlPosition {
  if (encoded <= PREGAME) {
    return { period: 1, minutes: 20, seconds: 0 };
  }
  if (encoded >= NHL_OT_MAX) {
    return { period: 4, minutes: 0, seconds: 0 };
  }

  const secondsElapsedInPeriod = encoded % 1200;

  // Handle exact period boundaries (e.g., 1200 = P2 20:00, but prefer P1 0:00)
  if (secondsElapsedInPeriod === 0 && encoded > 0) {
    const actualPeriod = Math.min(Math.floor((encoded - 1) / 1200) + 1, 5) as 1 | 2 | 3 | 4 | 5;
    return { period: actualPeriod, minutes: 0, seconds: 0 };
  }

  const period = Math.min(Math.floor(encoded / 1200) + 1, 5) as 1 | 2 | 3 | 4 | 5;
  const timeRemaining = 1200 - secondsElapsedInPeriod;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return { period, minutes, seconds };
}

/**
 * Decode MLB position from integer
 */
export function decodeMlbPosition(encoded: number): MlbPosition {
  if (encoded <= PREGAME) {
    return { inning: 1, half: "TOP", outs: 0 };
  }
  if (encoded >= MLB_MAX) {
    return { inning: 9, half: "BOTTOM", outs: 2 };
  }

  const inning = Math.floor(encoded / 8) + 1;
  const remainder = encoded % 8;
  const half: "TOP" | "BOTTOM" = remainder < 4 ? "TOP" : "BOTTOM";
  const outsRemainder = remainder % 4;
  const outs: 0 | 1 | 2 = outsRemainder >= 3 ? 2 : (outsRemainder as 0 | 1 | 2);

  return { inning, half, outs };
}

/**
 * Unified decoder - routes to sport-specific function
 */
export function decodePosition(
  encoded: number,
  sport: "nfl" | "mlb" | "nba" | "nhl"
): GamePosition {
  switch (sport) {
    case "nfl":
      return decodeNflPosition(encoded);
    case "nba":
      return decodeNbaPosition(encoded);
    case "nhl":
      return decodeNhlPosition(encoded);
    case "mlb":
      return decodeMlbPosition(encoded);
    default:
      throw new Error(`Unsupported sport: ${sport}`);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get maximum encoded position for a sport (end of regulation)
 * Use getMaxPositionWithOT for games that have overtime
 */
export function getMaxPosition(sport: "nfl" | "mlb" | "nba" | "nhl"): number {
  switch (sport) {
    case "nfl":
      return NFL_MAX - 1; // 3599 (Q4 0:00)
    case "nba":
      return NBA_MAX - 1; // 2879 (Q4 0:00)
    case "nhl":
      return NHL_MAX - 1; // 3599 (P3 0:00)
    case "mlb":
      return MLB_MAX; // 71 (Bottom 9th, END)
    default:
      throw new Error(`Unsupported sport: ${sport}`);
  }
}

/**
 * Get maximum encoded position including overtime
 * @param otPeriods Number of overtime periods (1 for single OT, 2 for double OT, etc.)
 */
export function getMaxPositionWithOT(
  sport: "nfl" | "mlb" | "nba" | "nhl",
  otPeriods: number = 0
): number {
  if (otPeriods <= 0) {
    return getMaxPosition(sport);
  }

  switch (sport) {
    case "nfl":
      // NFL OT: 10-minute period (but we use 900-second slots for consistency)
      return NFL_MAX + otPeriods * 900 - 1;
    case "nba":
      // NBA OT: 5-minute periods (but we use 720-second slots for consistency)
      return NBA_MAX + otPeriods * 720 - 1;
    case "nhl":
      // NHL OT: 20-minute periods (regular season) or 5-on-5 (playoffs)
      return NHL_MAX + otPeriods * 1200 - 1;
    case "mlb":
      // MLB extra innings: 8 positions per inning
      return MLB_MAX + otPeriods * 8;
    default:
      throw new Error(`Unsupported sport: ${sport}`);
  }
}

/**
 * Determine if a game went to overtime based on scoring plays
 */
export function hasOvertime(
  scoringPlays: Array<{ period: number }> | undefined,
  sport: "nfl" | "mlb" | "nba" | "nhl"
): boolean {
  if (!scoringPlays || scoringPlays.length === 0) return false;

  const maxPeriod = Math.max(...scoringPlays.map(p => p.period));

  switch (sport) {
    case "nfl":
      return maxPeriod > 4;
    case "nba":
      return maxPeriod > 4;
    case "nhl":
      return maxPeriod > 3;
    case "mlb":
      return maxPeriod > 9;
    default:
      return false;
  }
}

/**
 * Get number of overtime periods from scoring plays
 */
export function getOvertimePeriods(
  scoringPlays: Array<{ period: number }> | undefined,
  sport: "nfl" | "mlb" | "nba" | "nhl"
): number {
  if (!scoringPlays || scoringPlays.length === 0) return 0;

  const maxPeriod = Math.max(...scoringPlays.map(p => p.period));

  switch (sport) {
    case "nfl":
      return Math.max(0, maxPeriod - 4);
    case "nba":
      return Math.max(0, maxPeriod - 4);
    case "nhl":
      return Math.max(0, maxPeriod - 3);
    case "mlb":
      return Math.max(0, maxPeriod - 9);
    default:
      return 0;
  }
}

/**
 * Get initial position for a sport (game start)
 */
export function getInitialEncodedPosition(
  sport: "nfl" | "mlb" | "nba" | "nhl"
): number {
  return 0; // All sports start at 0
}

/**
 * Convert encoded position to percentage (0-100)
 */
export function positionToPercentage(
  encoded: number,
  sport: "nfl" | "mlb" | "nba" | "nhl"
): number {
  if (encoded <= PREGAME) return 0;
  const max = getMaxPosition(sport);
  if (encoded >= max) return 100;
  return Math.min(100, Math.max(0, (encoded / max) * 100));
}

/**
 * Convert percentage (0-100) to encoded position
 */
export function percentageToPosition(
  percentage: number,
  sport: "nfl" | "mlb" | "nba" | "nhl"
): number {
  const clamped = Math.min(100, Math.max(0, percentage));
  const max = getMaxPosition(sport);
  return Math.round((clamped / 100) * max);
}

/**
 * Check if message position is visible to user
 * THE CORE SPOILER RULE: message visible if msgPos <= userPos
 */
export function isPositionVisible(
  messagePos: number,
  userPos: number
): boolean {
  return messagePos <= userPos;
}

/**
 * Filter messages by position
 */
export function filterMessagesByPosition<T extends { position_encoded: number }>(
  messages: T[],
  userPos: number
): T[] {
  return messages.filter((msg) => isPositionVisible(msg.position_encoded, userPos));
}

/**
 * Get quarter/period/inning number from encoded position (for UI segmentation)
 * IMPORTANT: At exact boundaries (e.g., position 900), this returns the CURRENT segment
 * (end of Q1 = Q1, not start of Q2), consistent with decodeNflPosition behavior.
 * Supports OT: NFL Q5, NBA Q5+, NHL P4+, MLB 10th+
 */
export function getSegmentFromPosition(
  encoded: number,
  sport: "nfl" | "mlb" | "nba" | "nhl"
): number {
  if (encoded <= PREGAME) return 1;

  switch (sport) {
    case "nfl": {
      // At exact boundary (900, 1800, 2700, 3600), treat as end of previous quarter
      if (encoded > 0 && encoded % 900 === 0) {
        return Math.min(Math.floor((encoded - 1) / 900) + 1, 5); // Max Q5 (OT)
      }
      return Math.min(Math.floor(encoded / 900) + 1, 5);
    }
    case "nba": {
      // At exact boundary (720, 1440, 2160, 2880, etc.), treat as end of previous quarter
      if (encoded > 0 && encoded % 720 === 0) {
        return Math.min(Math.floor((encoded - 1) / 720) + 1, 8); // Max Q8 (4 OT)
      }
      return Math.min(Math.floor(encoded / 720) + 1, 8);
    }
    case "nhl": {
      // At exact boundary (1200, 2400, 3600, etc.), treat as end of previous period
      if (encoded > 0 && encoded % 1200 === 0) {
        return Math.min(Math.floor((encoded - 1) / 1200) + 1, 5); // Max P5 (2 OT)
      }
      return Math.min(Math.floor(encoded / 1200) + 1, 5);
    }
    case "mlb":
      return Math.floor(encoded / 8) + 1; // No cap for extra innings
    default:
      return 1;
  }
}

/**
 * Get start position for a specific segment (quarter/period/inning)
 */
export function getSegmentStartPosition(
  segment: number,
  sport: "nfl" | "mlb" | "nba" | "nhl"
): number {
  switch (sport) {
    case "nfl":
      return (segment - 1) * 900;
    case "nba":
      return (segment - 1) * 720;
    case "nhl":
      return (segment - 1) * 1200;
    case "mlb":
      return (segment - 1) * 8;
    default:
      return 0;
  }
}

/**
 * Get end position for a specific segment
 * Note: End of quarter includes the exact boundary (e.g., position 900 for Q1)
 * This represents Q1 0:00 (end of Q1), not Q2 15:00 (start of Q2)
 */
export function getSegmentEndPosition(
  segment: number,
  sport: "nfl" | "mlb" | "nba" | "nhl"
): number {
  switch (sport) {
    case "nfl":
      return segment * 900; // Q1 ends at 900 (Q1 0:00), Q2 at 1800, etc.
    case "nba":
      return segment * 720; // Q1 ends at 720, Q2 at 1440, etc.
    case "nhl":
      return segment * 1200; // P1 ends at 1200, P2 at 2400, etc.
    case "mlb":
      return segment * 8 - 1;
    default:
      return 0;
  }
}

/**
 * Check if a position is at a segment boundary (end of quarter/period)
 */
export function isAtSegmentBoundary(
  encoded: number,
  sport: "nfl" | "mlb" | "nba" | "nhl"
): boolean {
  if (encoded <= 0) return false;
  switch (sport) {
    case "nfl":
      return encoded % 900 === 0 && encoded < NFL_MAX;
    case "nba":
      return encoded % 720 === 0 && encoded < NBA_MAX;
    case "nhl":
      return encoded % 1200 === 0 && encoded < NHL_MAX;
    case "mlb":
      // MLB doesn't have time-based boundaries
      return false;
    default:
      return false;
  }
}

/**
 * Get a human-readable position label for special game moments
 */
export function getPositionLabel(
  encoded: number,
  sport: "nfl" | "mlb" | "nba" | "nhl"
): string | null {
  if (encoded === 0) return "Start of Game";

  const maxPos = getMaxPosition(sport);
  if (encoded >= maxPos) return "End of Game";

  switch (sport) {
    case "nfl": {
      if (encoded === 900) return "End of Q1";
      if (encoded === 1800) return "Halftime";
      if (encoded === 2700) return "End of Q3";
      break;
    }
    case "nba": {
      if (encoded === 720) return "End of Q1";
      if (encoded === 1440) return "Halftime";
      if (encoded === 2160) return "End of Q3";
      break;
    }
    case "nhl": {
      if (encoded === 1200) return "End of P1";
      if (encoded === 2400) return "End of P2";
      break;
    }
    case "mlb": {
      // Special MLB positions
      if (encoded === 35) return "7th Inning Stretch";
      break;
    }
  }
  return null;
}
