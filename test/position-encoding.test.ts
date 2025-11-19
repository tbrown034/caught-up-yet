import { describe, it, expect } from "vitest";
import {
  encodeNflPosition,
  decodeNflPosition,
  encodeNbaPosition,
  decodeNbaPosition,
  encodeNhlPosition,
  decodeNhlPosition,
  encodeMlbPosition,
  decodeMlbPosition,
  encodePosition,
  decodePosition,
  positionToPercentage,
  percentageToPosition,
  isPositionVisible,
  filterMessagesByPosition,
  getSegmentFromPosition,
  getMaxPosition,
  getMaxPositionWithOT,
  hasOvertime,
  getOvertimePeriods,
  getPositionLabel,
  NFL_MAX,
  NBA_MAX,
  NHL_MAX,
  MLB_MAX,
  PREGAME,
} from "@/lib/position-encoding";

describe("NFL Position Encoding", () => {
  it("encodes start of game correctly", () => {
    expect(encodeNflPosition({ quarter: 1, minutes: 15, seconds: 0 })).toBe(0);
  });

  it("encodes mid-quarter correctly", () => {
    // Q1 10:00 = 5 minutes elapsed = 300 seconds
    expect(encodeNflPosition({ quarter: 1, minutes: 10, seconds: 0 })).toBe(300);
  });

  it("encodes end of quarter correctly", () => {
    // Q1 0:00 = 15 minutes elapsed = 900 seconds - 1 position earlier
    expect(encodeNflPosition({ quarter: 1, minutes: 0, seconds: 0 })).toBe(900);
  });

  it("encodes Q2 start correctly", () => {
    expect(encodeNflPosition({ quarter: 2, minutes: 15, seconds: 0 })).toBe(900);
  });

  it("encodes Q4 end correctly", () => {
    expect(encodeNflPosition({ quarter: 4, minutes: 0, seconds: 0 })).toBe(3600);
  });

  it("handles seconds correctly", () => {
    // Q2 8:32 = 900 (Q1) + (15*60 - 8*60 - 32) = 900 + 388 = 1288
    expect(encodeNflPosition({ quarter: 2, minutes: 8, seconds: 32 })).toBe(1288);
  });

  it("decodes back to original position", () => {
    const original = { quarter: 3 as const, minutes: 7, seconds: 45 };
    const encoded = encodeNflPosition(original);
    const decoded = decodeNflPosition(encoded);
    expect(decoded).toEqual(original);
  });

  it("decodes pregame sentinel", () => {
    const decoded = decodeNflPosition(PREGAME);
    expect(decoded.quarter).toBe(1);
    expect(decoded.minutes).toBe(15);
  });

  it("decodes past end of game", () => {
    const decoded = decodeNflPosition(NFL_MAX + 100);
    // Now supports OT, so position beyond NFL_MAX is treated as OT (quarter 5)
    expect(decoded.quarter).toBe(5);
    // 3700 = 3600 + 100 = 100 seconds elapsed in OT, 900 - 100 = 800 sec remaining = 13:20
    expect(decoded.minutes).toBe(13);
    expect(decoded.seconds).toBe(20);
  });

  it("maintains monotonic ordering", () => {
    const positions = [
      { quarter: 1 as const, minutes: 15, seconds: 0 },
      { quarter: 1 as const, minutes: 10, seconds: 30 },
      { quarter: 2 as const, minutes: 5, seconds: 0 },
      { quarter: 3 as const, minutes: 0, seconds: 1 },
      { quarter: 4 as const, minutes: 2, seconds: 0 },
    ];

    const encoded = positions.map(encodeNflPosition);

    for (let i = 1; i < encoded.length; i++) {
      expect(encoded[i]).toBeGreaterThan(encoded[i - 1]);
    }
  });
});

describe("NBA Position Encoding", () => {
  it("encodes start of game correctly", () => {
    expect(encodeNbaPosition({ quarter: 1, minutes: 12, seconds: 0 })).toBe(0);
  });

  it("encodes Q4 end correctly", () => {
    expect(encodeNbaPosition({ quarter: 4, minutes: 0, seconds: 0 })).toBe(2880);
  });

  it("decodes back to original", () => {
    const original = { quarter: 2 as const, minutes: 6, seconds: 30 };
    const encoded = encodeNbaPosition(original);
    const decoded = decodeNbaPosition(encoded);
    expect(decoded).toEqual(original);
  });

  it("maintains monotonic ordering", () => {
    const pos1 = encodeNbaPosition({ quarter: 1, minutes: 12, seconds: 0 });
    const pos2 = encodeNbaPosition({ quarter: 2, minutes: 6, seconds: 0 });
    const pos3 = encodeNbaPosition({ quarter: 4, minutes: 0, seconds: 0 });
    expect(pos2).toBeGreaterThan(pos1);
    expect(pos3).toBeGreaterThan(pos2);
  });
});

describe("NHL Position Encoding", () => {
  it("encodes start of game correctly", () => {
    expect(encodeNhlPosition({ period: 1, minutes: 20, seconds: 0 })).toBe(0);
  });

  it("encodes P3 end correctly", () => {
    expect(encodeNhlPosition({ period: 3, minutes: 0, seconds: 0 })).toBe(3600);
  });

  it("decodes back to original", () => {
    const original = { period: 2 as const, minutes: 14, seconds: 22 };
    const encoded = encodeNhlPosition(original);
    const decoded = decodeNhlPosition(encoded);
    expect(decoded).toEqual(original);
  });

  it("maintains monotonic ordering", () => {
    const pos1 = encodeNhlPosition({ period: 1, minutes: 20, seconds: 0 });
    const pos2 = encodeNhlPosition({ period: 2, minutes: 10, seconds: 0 });
    const pos3 = encodeNhlPosition({ period: 3, minutes: 0, seconds: 0 });
    expect(pos2).toBeGreaterThan(pos1);
    expect(pos3).toBeGreaterThan(pos2);
  });
});

describe("MLB Position Encoding", () => {
  it("encodes Top 1st 0 outs correctly", () => {
    expect(encodeMlbPosition({ inning: 1, half: "TOP", outs: 0 })).toBe(0);
  });

  it("encodes Top 1st 2 outs correctly", () => {
    expect(encodeMlbPosition({ inning: 1, half: "TOP", outs: 2 })).toBe(2);
  });

  it("encodes Bottom 1st 0 outs correctly", () => {
    expect(encodeMlbPosition({ inning: 1, half: "BOTTOM", outs: 0 })).toBe(4);
  });

  it("encodes Top 2nd 0 outs correctly", () => {
    expect(encodeMlbPosition({ inning: 2, half: "TOP", outs: 0 })).toBe(8);
  });

  it("encodes Bottom 9th 2 outs correctly", () => {
    expect(encodeMlbPosition({ inning: 9, half: "BOTTOM", outs: 2 })).toBe(70);
  });

  it("decodes back to original", () => {
    const original = { inning: 5, half: "BOTTOM" as const, outs: 1 as const };
    const encoded = encodeMlbPosition(original);
    const decoded = decodeMlbPosition(encoded);
    expect(decoded.inning).toBe(original.inning);
    expect(decoded.half).toBe(original.half);
    expect(decoded.outs).toBe(original.outs);
  });

  it("handles END of half (no outs field)", () => {
    // End of half is represented as outs = 3 internally
    const pos = encodeMlbPosition({ inning: 1, half: "TOP", outs: undefined });
    expect(pos).toBe(3); // Top 1st END
  });

  it("maintains monotonic ordering through innings", () => {
    const positions = [
      { inning: 1, half: "TOP" as const, outs: 0 as const },
      { inning: 1, half: "TOP" as const, outs: 2 as const },
      { inning: 1, half: "BOTTOM" as const, outs: 0 as const },
      { inning: 2, half: "TOP" as const, outs: 1 as const },
      { inning: 5, half: "BOTTOM" as const, outs: 2 as const },
      { inning: 9, half: "BOTTOM" as const, outs: 2 as const },
    ];

    const encoded = positions.map(encodeMlbPosition);

    for (let i = 1; i < encoded.length; i++) {
      expect(encoded[i]).toBeGreaterThan(encoded[i - 1]);
    }
  });
});

describe("Unified Position Functions", () => {
  it("encodes via sport router", () => {
    const nflPos = { quarter: 2 as const, minutes: 8, seconds: 0 };
    expect(encodePosition(nflPos, "nfl")).toBe(encodeNflPosition(nflPos));

    const mlbPos = { inning: 3, half: "TOP" as const, outs: 1 as const };
    expect(encodePosition(mlbPos, "mlb")).toBe(encodeMlbPosition(mlbPos));
  });

  it("decodes via sport router", () => {
    const nflEncoded = 1500;
    expect(decodePosition(nflEncoded, "nfl")).toEqual(decodeNflPosition(nflEncoded));

    const mlbEncoded = 20;
    expect(decodePosition(mlbEncoded, "mlb")).toEqual(decodeMlbPosition(mlbEncoded));
  });
});

describe("Percentage Conversion", () => {
  it("converts 0% to start position", () => {
    expect(percentageToPosition(0, "nfl")).toBe(0);
  });

  it("converts 100% to max position", () => {
    const maxNfl = getMaxPosition("nfl");
    expect(percentageToPosition(100, "nfl")).toBe(maxNfl);
  });

  it("converts 50% to midpoint", () => {
    const maxNfl = getMaxPosition("nfl");
    const midpoint = percentageToPosition(50, "nfl");
    // Allow for rounding: 3599 / 2 = 1799.5, rounds to 1800
    expect(Math.abs(midpoint - maxNfl / 2)).toBeLessThanOrEqual(1);
  });

  it("converts position back to percentage", () => {
    const maxNfl = getMaxPosition("nfl");
    expect(positionToPercentage(0, "nfl")).toBe(0);
    expect(positionToPercentage(maxNfl, "nfl")).toBe(100);
    expect(positionToPercentage(maxNfl / 2, "nfl")).toBeCloseTo(50, 0);
  });

  it("handles pregame sentinel", () => {
    expect(positionToPercentage(PREGAME, "nfl")).toBe(0);
  });

  it("clamps out of range values", () => {
    expect(positionToPercentage(999999, "nfl")).toBe(100);
    expect(percentageToPosition(-50, "nfl")).toBe(0);
    expect(percentageToPosition(200, "nfl")).toBe(getMaxPosition("nfl"));
  });
});

describe("Spoiler Protection", () => {
  it("shows message at same position", () => {
    expect(isPositionVisible(100, 100)).toBe(true);
  });

  it("shows message before user position", () => {
    expect(isPositionVisible(50, 100)).toBe(true);
  });

  it("hides message after user position", () => {
    expect(isPositionVisible(150, 100)).toBe(false);
  });

  it("filters messages correctly", () => {
    const messages = [
      { id: 1, position_encoded: 10, content: "Early" },
      { id: 2, position_encoded: 50, content: "Middle" },
      { id: 3, position_encoded: 100, content: "Current" },
      { id: 4, position_encoded: 150, content: "Future - SPOILER" },
      { id: 5, position_encoded: 200, content: "Far future - SPOILER" },
    ];

    const userPosition = 100;
    const visible = filterMessagesByPosition(messages, userPosition);

    expect(visible).toHaveLength(3);
    expect(visible.map((m) => m.id)).toEqual([1, 2, 3]);
  });

  it("shows all messages when user at end", () => {
    const messages = [
      { id: 1, position_encoded: 10, content: "A" },
      { id: 2, position_encoded: 3599, content: "B" },
    ];

    const visible = filterMessagesByPosition(messages, 3599);
    expect(visible).toHaveLength(2);
  });

  it("shows no future messages", () => {
    const messages = [
      { id: 1, position_encoded: 100, content: "Future" },
    ];

    const visible = filterMessagesByPosition(messages, 50);
    expect(visible).toHaveLength(0);
  });
});

describe("Segment Detection", () => {
  it("detects NFL quarter correctly", () => {
    expect(getSegmentFromPosition(0, "nfl")).toBe(1);
    expect(getSegmentFromPosition(450, "nfl")).toBe(1); // Mid Q1
    // Position 900 is now "end of Q1" (boundary), not "start of Q2"
    expect(getSegmentFromPosition(900, "nfl")).toBe(1); // End of Q1
    expect(getSegmentFromPosition(901, "nfl")).toBe(2); // Start of Q2
    expect(getSegmentFromPosition(2700, "nfl")).toBe(3); // End of Q3
    expect(getSegmentFromPosition(2701, "nfl")).toBe(4); // Start of Q4
  });

  it("detects NBA quarter correctly", () => {
    expect(getSegmentFromPosition(0, "nba")).toBe(1);
    // Position 720 is now "end of Q1" (boundary), not "start of Q2"
    expect(getSegmentFromPosition(720, "nba")).toBe(1); // End of Q1
    expect(getSegmentFromPosition(721, "nba")).toBe(2); // Start of Q2
    expect(getSegmentFromPosition(2160, "nba")).toBe(3); // End of Q3
    expect(getSegmentFromPosition(2161, "nba")).toBe(4); // Start of Q4
  });

  it("detects NHL period correctly", () => {
    expect(getSegmentFromPosition(0, "nhl")).toBe(1);
    // Position 1200 is now "end of P1" (boundary), not "start of P2"
    expect(getSegmentFromPosition(1200, "nhl")).toBe(1); // End of P1
    expect(getSegmentFromPosition(1201, "nhl")).toBe(2); // Start of P2
    expect(getSegmentFromPosition(2400, "nhl")).toBe(2); // End of P2
    expect(getSegmentFromPosition(2401, "nhl")).toBe(3); // Start of P3
  });

  it("detects MLB inning correctly", () => {
    expect(getSegmentFromPosition(0, "mlb")).toBe(1);
    expect(getSegmentFromPosition(8, "mlb")).toBe(2);
    expect(getSegmentFromPosition(64, "mlb")).toBe(9);
  });

  it("handles pregame", () => {
    expect(getSegmentFromPosition(PREGAME, "nfl")).toBe(1);
  });
});

describe("Round-trip Encoding", () => {
  it("NFL round-trip preserves all positions", () => {
    for (let q = 1; q <= 4; q++) {
      for (let m = 0; m <= 15; m++) {
        // Skip Q2+ 15:00 as it encodes to same position as Q(n-1) 0:00
        // This is correct for spoiler filtering (same game moment)
        if (q > 1 && m === 15) continue;

        // Only test valid seconds (skip if would exceed 15:00)
        const maxSeconds = m === 15 ? 0 : 59; // At 15 minutes, only 0 seconds is valid
        for (let s = 0; s <= maxSeconds; s += 15) {
          const original = { quarter: q as 1 | 2 | 3 | 4, minutes: m, seconds: s };
          const encoded = encodeNflPosition(original);
          const decoded = decodeNflPosition(encoded);
          expect(decoded).toEqual(original);
        }
      }
    }
  });

  it("NFL quarter boundaries encode consistently", () => {
    // Q1 0:00 and Q2 15:00 are the same game moment
    const q1End = encodeNflPosition({ quarter: 1, minutes: 0, seconds: 0 });
    const q2Start = encodeNflPosition({ quarter: 2, minutes: 15, seconds: 0 });
    expect(q1End).toBe(q2Start); // Both encode to 900

    // Decoding always prefers "end of previous quarter" representation
    const decoded = decodeNflPosition(900);
    expect(decoded).toEqual({ quarter: 1, minutes: 0, seconds: 0 });
  });

  it("MLB round-trip preserves all positions", () => {
    for (let inning = 1; inning <= 9; inning++) {
      for (const half of ["TOP", "BOTTOM"] as const) {
        for (const outs of [0, 1, 2] as const) {
          const original = { inning, half, outs };
          const encoded = encodeMlbPosition(original);
          const decoded = decodeMlbPosition(encoded);
          expect(decoded.inning).toBe(original.inning);
          expect(decoded.half).toBe(original.half);
          expect(decoded.outs).toBe(original.outs);
        }
      }
    }
  });
});

describe("Overtime Support", () => {
  it("encodes NFL OT positions correctly", () => {
    const otStart = encodeNflPosition({ quarter: 5, minutes: 10, seconds: 0 });
    expect(otStart).toBe(3600 + 300); // Q5 starts at 3600, 10 min left = 300 elapsed
  });

  it("decodes NFL OT positions correctly", () => {
    const decoded = decodeNflPosition(3700); // 100 seconds into OT
    expect(decoded.quarter).toBe(5);
    // 3700 - 3600 = 100 elapsed, 900 - 100 = 800 remaining = 13:20
    expect(decoded.minutes).toBe(13);
    expect(decoded.seconds).toBe(20);
  });

  it("encodes NBA OT positions correctly", () => {
    const otStart = encodeNbaPosition({ quarter: 5, minutes: 5, seconds: 0 });
    expect(otStart).toBe(2880 + 420); // Q5 starts at 2880, 5 min = 300 sec, so 420 elapsed
  });

  it("decodes NBA OT positions correctly", () => {
    const decoded = decodeNbaPosition(3000); // In OT
    expect(decoded.quarter).toBe(5);
    expect(decoded.minutes).toBe(10); // 720 - 120 = 600 seconds = 10 min
    expect(decoded.seconds).toBe(0);
  });

  it("encodes NHL OT positions correctly", () => {
    const otStart = encodeNhlPosition({ period: 4, minutes: 20, seconds: 0 });
    expect(otStart).toBe(3600); // P4 starts at 3600
  });

  it("decodes NHL OT positions correctly", () => {
    const decoded = decodeNhlPosition(3800); // 200 seconds into OT
    expect(decoded.period).toBe(4);
    expect(decoded.minutes).toBe(16);
    expect(decoded.seconds).toBe(40);
  });

  it("hasOvertime detects OT correctly", () => {
    const nflOtPlays = [{ period: 1 }, { period: 2 }, { period: 5 }];
    expect(hasOvertime(nflOtPlays, "nfl")).toBe(true);

    const nflRegularPlays = [{ period: 1 }, { period: 4 }];
    expect(hasOvertime(nflRegularPlays, "nfl")).toBe(false);

    const nhlOtPlays = [{ period: 3 }, { period: 4 }];
    expect(hasOvertime(nhlOtPlays, "nhl")).toBe(true);

    const nhlRegularPlays = [{ period: 1 }, { period: 3 }];
    expect(hasOvertime(nhlRegularPlays, "nhl")).toBe(false);
  });

  it("getOvertimePeriods returns correct count", () => {
    const nflOtPlays = [{ period: 5 }];
    expect(getOvertimePeriods(nflOtPlays, "nfl")).toBe(1);

    const nbaDoubleOtPlays = [{ period: 6 }];
    expect(getOvertimePeriods(nbaDoubleOtPlays, "nba")).toBe(2);

    const noOtPlays = [{ period: 4 }];
    expect(getOvertimePeriods(noOtPlays, "nfl")).toBe(0);
  });

  it("getMaxPositionWithOT calculates correctly", () => {
    // NFL with 1 OT
    expect(getMaxPositionWithOT("nfl", 1)).toBe(3600 + 900 - 1); // 4499

    // NBA with 2 OT
    expect(getMaxPositionWithOT("nba", 2)).toBe(2880 + 2 * 720 - 1); // 4319

    // No OT (same as regular)
    expect(getMaxPositionWithOT("nfl", 0)).toBe(3599);
  });

  it("getPositionLabel returns correct labels", () => {
    expect(getPositionLabel(0, "nfl")).toBe("Start of Game");
    expect(getPositionLabel(900, "nfl")).toBe("End of Q1");
    expect(getPositionLabel(1800, "nfl")).toBe("Halftime");
    expect(getPositionLabel(2700, "nfl")).toBe("End of Q3");
    expect(getPositionLabel(3599, "nfl")).toBe("End of Game");
    expect(getPositionLabel(500, "nfl")).toBeNull(); // Regular position, no special label
  });
});
