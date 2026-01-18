// External API endpoints
export const API_ENDPOINTS = {
  ESPN_BASE: "https://site.api.espn.com/apis/site/v2/sports",
} as const;

// Sport-specific ESPN paths
export const ESPN_SPORT_PATHS = {
  nfl: "football/nfl",
  cfb: "football/college-football",
  mlb: "baseball/mlb",
  nba: "basketball/nba",
  nhl: "hockey/nhl",
} as const;
