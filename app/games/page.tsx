import { fetchAllSportsGames } from "@/lib/espn-api";
import AuthAwareGamesContainer from "@/components/games/AuthAwareGamesContainer";

export default async function GamesPage() {
  const today = new Date();
  const initialGames = await fetchAllSportsGames(today);

  return (
    <AuthAwareGamesContainer initialGames={initialGames} initialDate={today} />
  );
}
