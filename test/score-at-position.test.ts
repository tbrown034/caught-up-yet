import { describe, it, expect } from "vitest";
import {
  getScoreAtPosition,
  isGameLive,
  type ScoringPlay,
} from "@/lib/score-at-position";

describe("Score Calculation from Scoring Plays", () => {
  describe("NFL Score Calculation", () => {
    const nflScoringPlays: ScoringPlay[] = [
      {
        id: "1",
        period: 1,
        clock: "10:30",
        clockValue: 630, // 10:30 remaining = 630 seconds
        awayScore: 0,
        homeScore: 7,
      },
      {
        id: "2",
        period: 2,
        clock: "5:15",
        clockValue: 315, // 5:15 remaining = 315 seconds
        awayScore: 7,
        homeScore: 7,
      },
      {
        id: "3",
        period: 3,
        clock: "12:00",
        clockValue: 720, // 12:00 remaining = 720 seconds
        awayScore: 7,
        homeScore: 14,
      },
    ];

    it("returns 0-0 before first scoring play", () => {
      // Q1 14:00 = 60 seconds elapsed (before first TD at Q1 10:30)
      const score = getScoreAtPosition(60, nflScoringPlays, "nfl");
      expect(score).toEqual({ awayScore: 0, homeScore: 0 });
    });

    it("returns correct score after first TD", () => {
      // Q1 5:00 = 600 seconds elapsed (after first TD at Q1 10:30)
      const score = getScoreAtPosition(600, nflScoringPlays, "nfl");
      expect(score).toEqual({ awayScore: 0, homeScore: 7 });
    });

    it("returns correct score after second TD", () => {
      // Q2 2:00 = 900 + 780 = 1680 seconds elapsed (after second TD at Q2 5:15)
      const score = getScoreAtPosition(1680, nflScoringPlays, "nfl");
      expect(score).toEqual({ awayScore: 7, homeScore: 7 });
    });

    it("returns correct score in third quarter", () => {
      // Q3 10:00 = 1800 + 300 = 2100 seconds elapsed (after third TD at Q3 12:00)
      const score = getScoreAtPosition(2100, nflScoringPlays, "nfl");
      expect(score).toEqual({ awayScore: 7, homeScore: 14 });
    });

    it("handles empty scoring plays array", () => {
      const score = getScoreAtPosition(1000, [], "nfl");
      expect(score).toEqual({ awayScore: 0, homeScore: 0 });
    });
  });

  describe("NBA Score Calculation", () => {
    const nbaScoringPlays: ScoringPlay[] = [
      {
        id: "1",
        period: 1,
        clock: "8:30",
        clockValue: 510, // 8:30 remaining
        awayScore: 5,
        homeScore: 2,
      },
      {
        id: "2",
        period: 2,
        clock: "6:00",
        clockValue: 360, // 6:00 remaining
        awayScore: 15,
        homeScore: 12,
      },
    ];

    it("returns 0-0 before first basket", () => {
      // Q1 11:00 = 60 seconds elapsed
      const score = getScoreAtPosition(60, nbaScoringPlays, "nba");
      expect(score).toEqual({ awayScore: 0, homeScore: 0 });
    });

    it("returns correct score after first basket", () => {
      // Q1 5:00 = 420 seconds elapsed (after score at Q1 8:30)
      const score = getScoreAtPosition(420, nbaScoringPlays, "nba");
      expect(score).toEqual({ awayScore: 5, homeScore: 2 });
    });

    it("returns correct score in second quarter", () => {
      // Q2 3:00 = 720 + 540 = 1260 seconds elapsed (after score at Q2 6:00)
      const score = getScoreAtPosition(1260, nbaScoringPlays, "nba");
      expect(score).toEqual({ awayScore: 15, homeScore: 12 });
    });
  });

  describe("NHL Score Calculation", () => {
    const nhlScoringPlays: ScoringPlay[] = [
      {
        id: "1",
        period: 1,
        clock: "15:30",
        clockValue: 930, // 15:30 remaining
        awayScore: 1,
        homeScore: 0,
      },
      {
        id: "2",
        period: 2,
        clock: "10:00",
        clockValue: 600, // 10:00 remaining
        awayScore: 1,
        homeScore: 1,
      },
    ];

    it("returns 0-0 before first goal", () => {
      // P1 18:00 = 120 seconds elapsed
      const score = getScoreAtPosition(120, nhlScoringPlays, "nhl");
      expect(score).toEqual({ awayScore: 0, homeScore: 0 });
    });

    it("returns correct score after first goal", () => {
      // P1 10:00 = 600 seconds elapsed (after goal at P1 15:30)
      const score = getScoreAtPosition(600, nhlScoringPlays, "nhl");
      expect(score).toEqual({ awayScore: 1, homeScore: 0 });
    });

    it("returns correct score in second period", () => {
      // P2 5:00 = 1200 + 900 = 2100 seconds elapsed (after goal at P2 10:00)
      const score = getScoreAtPosition(2100, nhlScoringPlays, "nhl");
      expect(score).toEqual({ awayScore: 1, homeScore: 1 });
    });
  });

  describe("MLB Score Calculation", () => {
    const mlbScoringPlays: ScoringPlay[] = [
      {
        id: "1",
        period: 1, // Inning 1
        clock: "Bot",
        clockValue: 0,
        awayScore: 0,
        homeScore: 2,
      },
      {
        id: "2",
        period: 3, // Inning 3
        clock: "Top",
        clockValue: 0,
        awayScore: 3,
        homeScore: 2,
      },
    ];

    it("returns 0-0 before first run", () => {
      // Top 1st, 0 outs = position 0
      const score = getScoreAtPosition(0, mlbScoringPlays, "mlb");
      expect(score).toEqual({ awayScore: 0, homeScore: 0 });
    });

    it("returns correct score after first inning scoring", () => {
      // Top 2nd = position 8 (after Bot 1st)
      const score = getScoreAtPosition(8, mlbScoringPlays, "mlb");
      expect(score).toEqual({ awayScore: 0, homeScore: 2 });
    });

    it("returns correct score after away team scores", () => {
      // Bot 3rd = position 20 (after Top 3rd)
      const score = getScoreAtPosition(20, mlbScoringPlays, "mlb");
      expect(score).toEqual({ awayScore: 3, homeScore: 2 });
    });
  });

  describe("Edge Cases", () => {
    it("handles null/undefined scoring plays", () => {
      const score = getScoreAtPosition(1000, null as any, "nfl");
      expect(score).toEqual({ awayScore: 0, homeScore: 0 });
    });

    it("handles position at exact scoring moment", () => {
      const plays: ScoringPlay[] = [
        {
          id: "1",
          period: 1,
          clock: "10:00",
          clockValue: 600,
          awayScore: 7,
          homeScore: 0,
        },
      ];

      // Q1 10:00 = 300 seconds elapsed (exactly when score happened)
      const score = getScoreAtPosition(300, plays, "nfl");
      expect(score).toEqual({ awayScore: 7, homeScore: 0 });
    });

    it("handles multiple scoring plays in same period", () => {
      const plays: ScoringPlay[] = [
        {
          id: "1",
          period: 1,
          clock: "10:00",
          clockValue: 600,
          awayScore: 7,
          homeScore: 0,
        },
        {
          id: "2",
          period: 1,
          clock: "5:00",
          clockValue: 300,
          awayScore: 7,
          homeScore: 7,
        },
      ];

      // Q1 7:00 = 480 seconds elapsed (between two scores)
      const score = getScoreAtPosition(480, plays, "nfl");
      expect(score).toEqual({ awayScore: 7, homeScore: 0 });

      // Q1 2:00 = 780 seconds elapsed (after both scores)
      const score2 = getScoreAtPosition(780, plays, "nfl");
      expect(score2).toEqual({ awayScore: 7, homeScore: 7 });
    });
  });
});

describe("Game Status Detection", () => {
  it("detects live games correctly", () => {
    expect(isGameLive("STATUS_IN_PROGRESS")).toBe(true);
    expect(isGameLive("IN_PROGRESS")).toBe(true);
    expect(isGameLive("LIVE")).toBe(true);
  });

  it("detects non-live games correctly", () => {
    expect(isGameLive("STATUS_SCHEDULED")).toBe(false);
    expect(isGameLive("STATUS_FINAL")).toBe(false);
    expect(isGameLive("PRE")).toBe(false);
    expect(isGameLive("POST")).toBe(false);
  });
});
