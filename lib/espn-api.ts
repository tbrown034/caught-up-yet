export type Sport = "nfl" | "nba";

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
  }[];
}

const ESPN_BASE_URL = "https://site.api.espn.com/apis/site/v2/sports";

const SPORT_PATHS = {
  nfl: "football/nfl",
  mlb: "baseball/mlb",
  nba: "basketball/nba",
  nhl: "hockey/nhl",
} as const;

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
          },
        ],
      };
    });
  } catch (error) {
    console.error(`Error fetching ${sport} games:`, error);
    return [];
  }
}

export async function fetchAllSportsGames(date: Date): Promise<ESPNGame[]> {
  const [nflGames, nbaGames] = await Promise.all([
    fetchSportGames("nfl", date),
    fetchSportGames("nba", date),
  ]);

  return [...nflGames, ...nbaGames].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export { fetchSportGames };
