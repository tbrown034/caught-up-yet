import { API_ENDPOINTS, ESPN_SPORT_PATHS } from "@/constants/api";

export type Sport = "nfl" | "mlb" | "nba" | "nhl" | "cfb";

export interface ESPNGame {
  id: string;
  name: string;
  shortName: string;
  date: string;
  sport: Sport;
  status: {
    type: string;
    displayClock?: string;
    period?: number;
    detail: string;
  };
  competitors: {
    team: {
      displayName: string;
      abbreviation: string;
      logo: string;
      color: string;
    };
    score?: string;
    homeAway: "home" | "away";
    linescores?: number[]; // Quarter/period/inning scores
  }[];
}

// Use centralized API constants
const ESPN_BASE_URL = API_ENDPOINTS.ESPN_BASE;
const SPORT_PATHS = ESPN_SPORT_PATHS;

function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

async function fetchSportGames(sport: Sport, date: Date): Promise<ESPNGame[]> {
  const sportPath = SPORT_PATHS[sport];
  const dateParam = formatDateForAPI(date);
  const url = `${ESPN_BASE_URL}/${sportPath}/scoreboard?dates=${dateParam}`;

  try {
    const response = await fetch(url, { next: { revalidate: 60 } }); // Cache for 60 seconds
    if (!response.ok) {
      throw new Error(`Failed to fetch ${sport} games: ${response.status}`);
    }

    const data = await response.json();

    if (!data.events || data.events.length === 0) {
      return [];
    }

    return data.events.map((event: any) => {
      const competition = event.competitions[0];
      const homeTeam = competition.competitors.find((c: any) => c.homeAway === "home");
      const awayTeam = competition.competitors.find((c: any) => c.homeAway === "away");

      // Extract linescores (quarter/period/inning scores)
      const homeLinescores = homeTeam.linescores?.map((ls: any) => Number(ls.value)) || [];
      const awayLinescores = awayTeam.linescores?.map((ls: any) => Number(ls.value)) || [];

      return {
        id: event.id,
        name: event.name,
        shortName: event.shortName,
        date: event.date,
        sport,
        status: {
          type: event.status.type.name,
          displayClock: event.status.displayClock,
          period: event.status.period,
          detail: event.status.type.detail,
        },
        competitors: [
          {
            team: {
              displayName: awayTeam.team.displayName,
              abbreviation: awayTeam.team.abbreviation,
              logo: awayTeam.team.logo,
              color: awayTeam.team.color || "000000",
            },
            score: awayTeam.score,
            homeAway: "away" as const,
            linescores: awayLinescores,
          },
          {
            team: {
              displayName: homeTeam.team.displayName,
              abbreviation: homeTeam.team.abbreviation,
              logo: homeTeam.team.logo,
              color: homeTeam.team.color || "000000",
            },
            score: homeTeam.score,
            homeAway: "home" as const,
            linescores: homeLinescores,
          },
        ],
      };
    });
  } catch (error) {
    console.error(`Error fetching ${sport} games:`, error);
    return [];
  }
}

// Big Ten conference team abbreviations for filtering CFB games
const BIG_TEN_TEAMS = new Set([
  "MICH", "OSU", "PSU", "ORE", "IOWA", "WIS", "MINN", "NEB", "ILL", "IU",
  "PUR", "NW", "MSU", "MD", "RUTG", "UCLA", "USC", "WASH",
  // Alternative abbreviations
  "OHIO ST", "PENN ST", "OREGON", "INDIANA", "PURDUE", "NORTHWESTERN",
  "MICHIGAN ST", "MARYLAND", "RUTGERS", "MICHIGAN", "WISCONSIN", "MINNESOTA",
  "NEBRASKA", "ILLINOIS", "WASHINGTON"
]);

function isBigTenGame(game: ESPNGame): boolean {
  return game.competitors.some((c) => BIG_TEN_TEAMS.has(c.team.abbreviation.toUpperCase()));
}

/**
 * Check if a game actually occurs on the requested date
 * ESPN API sometimes returns games across multiple date queries
 * This ensures we only show games on the day they're actually scheduled
 */
function isGameOnDate(game: ESPNGame, requestedDate: Date): boolean {
  const gameDate = new Date(game.date);

  // Normalize both dates to compare just the calendar day (in local timezone)
  const gameDateLocal = new Date(gameDate.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const requestedDateNormalized = new Date(requestedDate);

  return (
    gameDateLocal.getFullYear() === requestedDateNormalized.getFullYear() &&
    gameDateLocal.getMonth() === requestedDateNormalized.getMonth() &&
    gameDateLocal.getDate() === requestedDateNormalized.getDate()
  );
}

export async function fetchAllSportsGames(date: Date): Promise<ESPNGame[]> {
  const [nflGames, mlbGames, nbaGames, nhlGames, cfbGames] = await Promise.all([
    fetchSportGames("nfl", date),
    fetchSportGames("mlb", date),
    fetchSportGames("nba", date),
    fetchSportGames("nhl", date),
    fetchSportGames("cfb", date),
  ]);

  // Filter CFB games:
  // 1. Must be a Big Ten game
  // 2. Must actually be scheduled on the requested date (ESPN API returns games across date boundaries)
  const filteredCfbGames = cfbGames
    .filter(isBigTenGame)
    .filter((game) => isGameOnDate(game, date));

  return [...nflGames, ...mlbGames, ...nbaGames, ...nhlGames, ...filteredCfbGames].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

// Scoring play type (matches database.types.ts ScoringPlay)
interface ESPNScoringPlay {
  id: string;
  period: number;
  clock: string;
  clockValue: number;
  awayScore: number;
  homeScore: number;
  description?: string;
  teamId?: string;
}

/**
 * Fetch detailed game summary including scoring plays
 * This provides play-by-play data for real-time score calculation
 */
export async function fetchGameScoringPlays(
  gameId: string,
  sport: Sport
): Promise<ESPNScoringPlay[]> {
  const sportPath = SPORT_PATHS[sport];
  const url = `${ESPN_BASE_URL}/${sportPath}/summary?event=${gameId}`;

  try {
    const response = await fetch(url, { next: { revalidate: 60 } });
    if (!response.ok) {
      console.error(`Failed to fetch game summary: ${response.status}`);
      return [];
    }

    const data = await response.json();

    // NFL uses 'scoringPlays', others use 'plays' with scoringPlay flag
    let plays: any[] = [];

    if (sport === "nfl" && data.scoringPlays) {
      plays = data.scoringPlays;
    } else if (data.plays) {
      // Filter for scoring plays only
      plays = data.plays.filter((play: any) => play.scoringPlay === true);
    }

    // Transform to our format
    return plays.map((play: any) => {
      // Parse clock value - ESPN gives seconds remaining in different formats
      let clockValue = 0;
      if (play.clock?.value !== undefined) {
        clockValue = play.clock.value;
      } else if (play.clock?.displayValue) {
        // Parse "8:14" format
        const parts = play.clock.displayValue.split(":");
        if (parts.length === 2) {
          clockValue = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
      }

      return {
        id: play.id || "",
        period: play.period?.number || 1,
        clock: play.clock?.displayValue || "0:00",
        clockValue,
        awayScore: play.awayScore || 0,
        homeScore: play.homeScore || 0,
        description: play.text || play.shortText || "",
        teamId: play.team?.id || "",
      };
    });
  } catch (error) {
    console.error(`Error fetching scoring plays for ${sport} game ${gameId}:`, error);
    return [];
  }
}

/**
 * Fetch live game status for a specific game
 * Used to update room's live position in real-time
 */
export async function fetchGameStatus(
  gameId: string,
  sport: Sport
): Promise<{
  type: string;
  displayClock?: string;
  period?: number;
  detail: string;
} | null> {
  const sportPath = SPORT_PATHS[sport];
  const url = `${ESPN_BASE_URL}/${sportPath}/summary?event=${gameId}`;

  try {
    const response = await fetch(url, { next: { revalidate: 0 } }); // No cache for live data
    if (!response.ok) {
      console.error(`Failed to fetch game status: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.header?.competitions?.[0]?.status) {
      return null;
    }

    const status = data.header.competitions[0].status;

    return {
      type: status.type?.name || "",
      displayClock: status.displayClock,
      period: status.period,
      detail: status.type?.detail || "",
    };
  } catch (error) {
    console.error(`Error fetching game status for ${sport} game ${gameId}:`, error);
    return null;
  }
}

export { fetchSportGames };
